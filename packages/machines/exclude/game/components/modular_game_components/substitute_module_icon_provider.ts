import { Random } from 'dart:math';
import { Container } from 'package:syd/syd.dart';
import { BaseModularSlotGame } from 'package:machines/machines.dart';
import { GameStateMachine } from 'package:shared/shared.dart';
import { IReelsStateProvider } from 'package:machines/src/reels_engine_library.dart';
import { ISlotGameModule } from 'package:common/common.dart';

class SubstituteModuleIconProvider {
  private _random: Random;
  private _container: Container;
  private _modularSlotGame: BaseModularSlotGame;
  private _gameStateMachine: GameStateMachine;
  private _reelStateProvider: IReelsStateProvider;
  private _symbolMap: SubstituteIconItem[];

  private _marker: string;
  private _affectedModules: string[];
  private _substituteStateName: string;
  private _allowPartialSubstitution: boolean;
  private _useLineIndexInSearch: boolean;
  private _takeFirstSubstituteIconIfNull: boolean;
  private _actionsInitialized: boolean;
  private _systemsCreated: boolean;

  constructor(
    container: Container,
    symbolMap: SubstituteIconItem[],
    allowPartialSubstitution: boolean,
    marker: string,
    affectedModules: string[],
    substituteStateName: string,
    useLineIndexInSearch: boolean = false,
    takeFirstSubstituteIconIfNull: boolean = true,
    useInStrategy: boolean = false
  ) {
    this._random = new Random();
    this._container = container;
    this._symbolMap = symbolMap;
    this._allowPartialSubstitution = allowPartialSubstitution;
    this._marker = marker;
    this._affectedModules = affectedModules;
    this._substituteStateName = substituteStateName;
    this._useLineIndexInSearch = useLineIndexInSearch;
    this._takeFirstSubstituteIconIfNull = takeFirstSubstituteIconIfNull;
    this._actionsInitialized = false;
    this._systemsCreated = false;

    this._modularSlotGame = this._container.forceResolve<ISlotGame>(
      T_ISlotGame
    ) as BaseModularSlotGame;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelStateProvider = this._container.resolve(IReelsStateProvider);

    this._takeFirstSubstituteIconIfNull = takeFirstSubstituteIconIfNull;

    this._gameStateMachine.accelerate.entered.listen((e) => {
      if (!this._systemsCreated) {
        this._modularSlotGame.modules
          .filter((m) => this._affectedModules.includes(m.moduleParams.gameId))
          .forEach((m) => this.createSystems(m));
        this._systemsCreated = true;
      }
    });

    if (useInStrategy) {
      this._gameStateMachine.stop.entered.listen((e) => {
        this.stateMachineStopEntered();
      });
    } else {
      this._gameStateMachine.accelerate.entered.listen((e) => {
        if (!this._actionsInitialized) {
          const waitStopActions: Action[] = [];
          this._modularSlotGame.modules
            .filter((m) => this._affectedModules.includes(m.moduleParams.gameId))
            .forEach((m) => {
              const moduleReelsEngine = m.getComponent(ISlotGameEngineProvider)
                .gameEngine as ReelsEngine;
              waitStopActions.push(
                new LazyAction(() => new ConditionAction(() => moduleReelsEngine.isSlotStopped))
              );
            });

          this._gameStateMachine.stop.appendLazyAnimation(
            () =>
              new SequenceSimpleAction([
                new ParallelSimpleAction(waitStopActions),
                new LazyAction(() => this.substituteAction()),
              ])
          );

          this._actionsInitialized = true;
        }
      });
    }
  }

  private createSystems(module: ISlotGameModule): void {
    const moduleReelsEngine = module.getComponent(ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;

    const substituteIconSystem = new SubstituteIconSystem(moduleReelsEngine.entityEngine);
    substituteIconSystem.updateOrder = 100;
    substituteIconSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      moduleReelsEngine.entityEngine,
      moduleReelsEngine.entityCacheHolder,
      [moduleReelsEngine.entityEngine.getComponentIndex(this._marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    );
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();

    const entityRemovalSystem = new EntityRemovalSystem(
      moduleReelsEngine.entityEngine,
      moduleReelsEngine.internalConfig,
      this._marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();

    const visibilityRestoreSystem = new VisibilityRestoreSystem(
      moduleReelsEngine.entityEngine,
      moduleReelsEngine.entityCacheHolder,
      moduleReelsEngine.internalConfig
    );
    visibilityRestoreSystem.updateOrder = 601;
    visibilityRestoreSystem.register();
  }

  private stateMachineStopEntered(): void {
    const winLineStrategyProvider = this._container.resolve(IWinLineStrategyProvider);
    const subAction = this.substituteAction();
    winLineStrategyProvider.substituteAnimationAction =
      subAction instanceof EmptyAction ? null : subAction;
  }

  private buildBeforeSubstituteAction(symbol: SpecialSymbolGroup): Action {
    return new EmptyAction();
  }

  private buildAfterSubstituteAction(symbol: SpecialSymbolGroup): Action {
    return new EmptyAction();
  }

  private substituteAction(): Action {
    const respinGroup =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    if (respinGroup && respinGroup.respinStarted) {
      return new EmptyAction().withDuration(0.0);
    }

    const actions: Action[] = [];
    const symbols = this._reelStateProvider.reelsState
      ? this._reelStateProvider.reelsState.specialSymbolGroups
      : null;
    const symbolGroups = symbols ? symbols.filter((p) => p.type === this._marker) : null;

    if (symbolGroups) {
      for (const symbolGroup of symbolGroups) {
        const module = this._modularSlotGame.modules.find(
          (m) => m.moduleParams.gameId === symbolGroup.affectedModules[0]
        );
        const moduleReelsEngine = module.getComponent(ISlotGameEngineProvider)
          .gameEngine as ReelsEngine;
        const moduleConfig = module.getComponent(IGameConfigProvider).gameConfig;
        const moduleIconModel = module.getComponent(IconModelComponent).iconModel;
        const moduleIconsSoundModel = module.getComponent(IconsSoundModelComponent).iconsSoundModel;
        const moduleReelParams = module.moduleParams as SlotParams;
        const iconAnimationHelper = moduleReelsEngine.iconAnimationHelper;
        const drawableIndex = moduleReelsEngine.entityEngine.getComponentIndex(
          ComponentNames.DrawableIndex
        );

        const symbolActions: Action[] = [];
        for (let i = 0; i < symbolGroup.positions.length; i++) {
          const pos = symbolGroup.positions[i];
          const reelIndex = pos % moduleReelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(pos / moduleReelsEngine.ReelConfig.reelCount);
          let drawId = iconAnimationHelper.getDrawIndexes(pos)[0];

          let substituteItem: SubstituteIconItem | null = null;
          this._symbolMap.forEach((x) => {
            if (
              x.symbolId === symbolGroup.symbolId &&
              (!this._useLineIndexInSearch || x.iconDescr.length === symbolGroup.positions.length)
            ) {
              substituteItem = x;
            }
          });

          if (this._takeFirstSubstituteIconIfNull) {
            substituteItem = !substituteItem ? this._symbolMap[0] : substituteItem;
          }

          if (substituteItem !== null) {
            const symbol = substituteItem.iconDescr;

            const longIcon = moduleReelParams.longIcons.find(
              (p) => p.iconIndex === Math.floor(drawId / 100)
            );
            const iconLength = longIcon !== undefined ? longIcon.length : 1;
            const symbolLength = symbol.length;

            const stoppedEntity =
              iconLength > symbolLength || this._allowPartialSubstitution
                ? moduleReelsEngine.getStopedEntities(reelIndex, lineIndex)[0]
                : iconAnimationHelper.getEntities(pos)[0];
            const entityPosition = stoppedEntity.get(
              moduleReelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
            );
            drawId = iconLength > symbolLength ? symbol.iconIndex : symbol.iconIndex + i;

            const iconsActions: Action[] = [];
            const entity = moduleReelsEngine.CreateEntity(reelIndex, lineIndex, drawId, [
              symbolGroup.type,
            ]);
            entity.addComponent(ComponentNames.Visible, false);

            iconsActions.push(
              new FunctionAction(() =>
                entity.addComponent(
                  ComponentNames.Position,
                  new Vector2(entityPosition.x, entityPosition.y)
                )
              )
            );
            iconsActions.push(new FunctionAction(() => entity.register()));
            iconsActions.push(
              new FunctionAction(() => {
                stoppedEntity.addComponent(ComponentNames.Visible, false);
                this.hideEntities(
                  stoppedEntity,
                  reelIndex,
                  lineIndex,
                  drawableIndex,
                  moduleReelsEngine,
                  moduleReelParams,
                  moduleConfig
                );
              })
            );
            iconsActions.push(
              new FunctionAction(() => entity.addComponent(ComponentNames.Visible, true))
            );

            const icons = moduleIconModel.getAnimIcon(drawId);
            if (
              icons.some(
                (icon) =>
                  icon.stateMachine !== null &&
                  icon.stateMachine.findById(this._substituteStateName) !== null
              )
            ) {
              const animationDuration = iconAnimationHelper.getEntityAnimDuration(
                entity,
                this._substituteStateName
              );
              iconsActions.push(
                new FunctionAction(
                  () => moduleReelsEngine.startAnimation(entity, this._substituteStateName),
                  false
                )
              );
              iconsActions.push(new EmptyAction().withDuration(animationDuration));
              symbolActions.push(
                new FunctionAction(() => {
                  moduleIconsSoundModel.getIconSound(drawId).stop();
                  moduleIconsSoundModel.getIconSound(drawId).play();
                })
              );
            }

            symbolActions.push(new SequenceSimpleAction(iconsActions));
          }
        }
        actions.push(
          new SequenceSimpleAction([
            this.buildBeforeSubstituteAction(symbolGroup),
            new ParallelSimpleAction(symbolActions),
            this.buildAfterSubstituteAction(symbolGroup),
          ])
        );
      }
      return new ParallelSimpleAction(actions);
    }
    return new EmptyAction();
  }

  private hideEntities(
    hiddedEntity: Entity,
    reelIndex: number,
    lineIndex: number,
    drawableIndex: ComponentIndex,
    moduleReelsEngine: ReelsEngine,
    moduleReelParams: SlotParams,
    moduleConfig: AbstractGameConfig
  ): void {
    const hidedEntityDrawId = hiddedentity.get<number>(drawableIndex);
    if (
      this.isLongIcon(hidedEntityDrawId, moduleReelParams) &&
      ((lineIndex === 0 && !this.isLongIconHeadId(hidedEntityDrawId, moduleReelParams)) ||
        (lineIndex === moduleReelsEngine.ReelConfig.lineCount - 1 &&
          !this.isLongIconTailId(hidedEntityDrawId, moduleReelParams)))
    ) {
      const entitiesToSubstitute =
        lineIndex === 0
          ? hidedEntityDrawId % 100
          : moduleReelParams.longIcons.find(
              (p) => p.iconIndex === Math.floor(hidedEntityDrawId / 100)
            )!.length -
            (hidedEntityDrawId % 100) -
            1;

      if (lineIndex === 0) {
        for (let line = -entitiesToSubstitute; line < 0; line++) {
          const entities = moduleReelsEngine.getStopedEntities(reelIndex, line);
          if (entities !== null) {
            const randomId = this.getRandomShortIcon(reelIndex, moduleReelParams, moduleConfig);
            entities.forEach((e) => e.set(drawableIndex, randomId));
          }
        }
      } else {
        for (let line = lineIndex + entitiesToSubstitute; line > lineIndex; line--) {
          const entities = moduleReelsEngine.getStopedEntities(reelIndex, line);
          if (entities !== null) {
            const randomId = this.getRandomShortIcon(reelIndex, moduleReelParams, moduleConfig);
            entities.forEach((e) => e.set(drawableIndex, randomId));
          }
        }
      }
    }
  }

  private isLongIcon(drawId: number, moduleReelParams: SlotParams): boolean {
    return (
      moduleReelParams.longIcons.filter((p) => p.iconIndex === Math.floor(drawId / 100)).length > 0
    );
  }

  private isLongIconHeadId(drawId: number, moduleReelParams: SlotParams): boolean {
    const longIconDescription = moduleReelParams.longIcons.find(
      (p) => p.iconIndex === Math.floor(drawId / 100)
    );
    return longIconDescription === undefined || drawId % 100 === 0;
  }

  private isLongIconTailId(drawId: number, moduleReelParams: SlotParams): boolean {
    const longIconDescription = moduleReelParams.longIcons.find(
      (p) => p.iconIndex === Math.floor(drawId / 100)
    );
    return longIconDescription === undefined || drawId % 100 === longIconDescription.length - 1;
  }

  private getRandomShortIcon(
    reel: number,
    moduleReelParams: SlotParams,
    moduleConfig: AbstractGameConfig
  ): number {
    let icon: number;
    do {
      const index = this._random.nextInt(moduleConfig.staticConfig.spinedReels[reel].length - 1);
      icon = moduleConfig.staticConfig.spinedReels[reel][index];
    } while (this.isLongIcon(icon, moduleReelParams));

    return icon;
  }
}
