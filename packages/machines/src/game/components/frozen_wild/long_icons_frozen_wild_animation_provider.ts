import { ResponseDependentGameComponentProvider } from '../response_dependent_game_component_provider';
import {
  Action,
  EmptyAction,
  FunctionAction,
  ParallelSimpleAction,
  Random,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';
import { SlotParams } from '../../../reels_engine/slot_params';
import { AbstractGameConfig } from '../../../reels_engine/game_config/abstract_game_config';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { IconAnimationHelper } from '../../../reels_engine/utils/icon_animation_helper';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { Entity } from '../../../reels_engine/entities_engine/entity';
import { Container } from '@cgs/syd';
import { ISlotGame } from '../../../reels_engine/i_slot_game';
import {
  T_IGameConfigProvider,
  T_ISlotGame,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../../type_definitions';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../../reels_engine/systems/update_entity_cache_system';
import { RemoveComponentsSystem } from '../../../reels_engine/systems/remove_components_system';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';

export class LongIconsFrozenWildAnimationProvider extends ResponseDependentGameComponentProvider {
  static readonly FrozenWildClientMarker = 'FrozenWildClientMarker';
  private readonly _random = new Random();
  private _reelsSlotGameParams: SlotParams;
  private _gameConfig: AbstractGameConfig;
  private _reelsEngine: ReelsEngine;
  private _iconAnimationHelper: IconAnimationHelper;
  private _reelsSoundModel: ReelsSoundModel;
  private _longToShortIconMap: Map<number, number>;
  private _frozenPositions: number[] = [];
  private _marker: string;
  private _soundName: string;
  private _preFrozenActionDuration: number;
  private _iconShowState: string;
  private _animateIcon: boolean;
  private _substituteIconMap: Map<number, number> | null;
  private _entitiesToRemove: Entity[] = [];

  constructor(
    container: Container,
    longToShortIconMap: Map<number, number>,
    {
      substituteIconMap = undefined,
      marker = 'FrozenWild',
      animateIcon = true,
      preFrozenActionDuration = 0.0,
      iconShowState = 'anim',
      soundName = '',
    }: {
      substituteIconMap?: Map<number, number>;
      marker?: string;
      animateIcon?: boolean;
      preFrozenActionDuration?: number;
      iconShowState?: string;
      soundName?: string;
    }
  ) {
    super(container);
    this._reelsSlotGameParams = container.forceResolve<ISlotGame>(T_ISlotGame)
      .gameParams as SlotParams;
    this._gameConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._preFrozenActionDuration = preFrozenActionDuration;
    this._iconShowState = iconShowState;
    this._animateIcon = animateIcon;
    this._marker = marker;
    this._soundName = soundName;
    this._longToShortIconMap = longToShortIconMap;
    this._substituteIconMap = substituteIconMap ?? null;
  }

  initialize(): void {
    this.createSystems(this._marker);
    this.attachActionsToGameStateMachine(this._marker);
  }

  attachActionsToGameStateMachine(marker: string): void {
    this.gameStateMachine.stopping.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.modifyResponseIfNeeded(marker))
    );

    this.gameStateMachine.endFreeSpinsPopup.entered.listen((_e) => {
      const frozenEntities = this._reelsEngine.entityEngine.getEntities(
        this._reelsEngine.entityEngine.getFilterByIndex([
          this._reelsEngine.entityEngine.getComponentIndex(marker),
        ])
      ).list;
      for (const entity of frozenEntities) {
        entity.removeComponent(marker);
        this._entitiesToRemove.push(entity);
      }

      this._frozenPositions = [];
    });

    this.gameStateMachine.accelerate.leaved.listen((_e) => {
      for (const entity of this._entitiesToRemove) {
        entity.unregister();
      }
      this._entitiesToRemove = [];
    });

    this.gameStateMachine.endFreeSpinsPopup.entered.listen((_e) => {
      this._frozenPositions = [];
    });

    this.gameStateMachine.freeSpinsRecovery.addLazyAnimationToBegin(
      () =>
        new SequenceSimpleAction([
          new FunctionAction(() => this.modifyResponseIfNeeded(marker)),
          new LazyAction(() => this.wildAction(marker, false)),
        ])
    );

    this.gameStateMachine.stop.addLazyAnimationToBegin(
      () =>
        new ParallelSimpleAction([
          this.preFrozenAction(this.currentResponse),
          this.wildAction(marker, this._animateIcon),
        ])
    );
  }

  modifyResponseIfNeeded(marker: string): void {
    const symbols = this.getSpecialSymbolsByMarker(this.currentResponse, marker);
    const symbolsToRemove: SpecialSymbolGroup[] = [];
    for (const symbol of symbols) {
      const lineIndexes: number[] = [];
      lineIndexes.push(
        ...symbol.positions!.map((p) => Math.floor(p / this._reelsEngine.ReelConfig.reelCount))
      );

      const longIcon =
        this._reelsSlotGameParams.longIcons.find((p) => p.iconIndex === symbol.symbolId) || null;
      const iconLength = longIcon ? longIcon.length : 1;

      const newPositions = symbol.positions!.filter((p) => !this._frozenPositions.includes(p));
      if (
        iconLength > lineIndexes.length ||
        this._frozenPositions.filter((p) => symbol.positions!.includes(p)).length > 0
      ) {
        symbolsToRemove.push(symbol);

        for (const newPosition of newPositions) {
          const shortIconId = this._longToShortIconMap.has(symbol.symbolId!)
            ? this._longToShortIconMap.get(symbol.symbolId!)!
            : -1;

          if (this.currentResponse.viewReels) {
            const reel = newPosition % this._reelsEngine.ReelConfig.reelCount;
            const line = Math.floor(newPosition / this._reelsEngine.ReelConfig.reelCount);
            this.currentResponse.viewReels[reel][line] = shortIconId;
          }

          const newGroup = new SpecialSymbolGroup();
          newGroup.type = symbol.type;
          newGroup.symbolId = shortIconId;
          newGroup.positions = [newPosition];
          this.currentResponse.specialSymbolGroups!.push(newGroup);
        }

        if (newPositions.length > 0 && this.currentResponse.viewReels) {
          const positions = symbol.positions!.filter((p) => this._frozenPositions.includes(p));
          for (const position of positions) {
            const reel = position % this._reelsEngine.ReelConfig.reelCount;
            const line = Math.floor(position / this._reelsEngine.ReelConfig.reelCount);
            const drawId = this.currentResponse.viewReels[reel][line];
            if (this.isLongIcon(drawId) && Math.floor(drawId / 100) === symbol.symbolId) {
              this.currentResponse.viewReels[reel][line] = this.getRandomShortIcon(reel);
            }
          }
        }
      }

      this._frozenPositions.push(...newPositions);
    }

    for (const symbolToRemove of symbolsToRemove) {
      this.currentResponse.specialSymbolGroups!.splice(
        this.currentResponse.specialSymbolGroups!.indexOf(symbolToRemove),
        1
      );
    }

    if (this.currentResponse.specialSymbolGroups) {
      for (const symbol of this.currentResponse.specialSymbolGroups) {
        if (this._substituteIconMap && this._substituteIconMap.has(symbol.symbolId!)) {
          symbol.symbolId = this._substituteIconMap.get(symbol.symbolId!)!;
        }
      }
    }
  }

  createSystems(marker: string): void {
    const frozenWildSystem = new RemoveComponentsSystem(this._reelsEngine.entityEngine, marker, [
      ComponentNames.AccelerationInterpolate,
      ComponentNames.BrakingCalculationInfo,
    ]);
    frozenWildSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      UpdateEntityCacheMode.AddAsForeground,
      UpdateEntityCacheMode.AddAsForeground
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();
  }

  preFrozenAction(_currentResponse: ISpinResponse): Action {
    return new EmptyAction();
  }

  wildAction(marker: string, animated: boolean): Action {
    const symbols = this.getSpecialSymbolsByMarker(this.currentResponse, marker);
    const animationActions: Action[] = [];
    //Convention is to use one symbol per icon here, if symbol has more than one position it's considered to be long icon
    for (const symbol of symbols) {
      const reelIndex = symbol.positions![0] % this._reelsEngine.ReelConfig.reelCount;
      const lineIndexes: number[] = [];
      lineIndexes.push(
        ...symbol.positions!.map((p) => Math.floor(p / this._reelsEngine.ReelConfig.reelCount))
      );

      for (let i = 0; i < lineIndexes.length; i++) {
        const lineIndex = lineIndexes[i];
        const longIcon =
          this._reelsSlotGameParams.longIcons.find((p) => p.iconIndex === symbol.symbolId) || null;
        const drawableAnimationIndex = longIcon ? symbol.symbolId! * 100 + i : symbol.symbolId!;

        if (!this._reelsEngine.GetEntity(reelIndex, lineIndex, drawableAnimationIndex, marker)) {
          const entity = this._reelsEngine.CreateEntity(
            reelIndex,
            lineIndex,
            drawableAnimationIndex,
            [marker, LongIconsFrozenWildAnimationProvider.FrozenWildClientMarker]
          );
          const offset = this._reelsEngine.internalConfig.reelsOffset[reelIndex];
          const entityPosition = new Vector2(
            this._reelsEngine.ReelConfig.symbolSize.x * reelIndex + offset.x,
            this._reelsEngine.ReelConfig.symbolSize.y * lineIndex + offset.y
          );
          entity.addComponent(ComponentNames.Position, entityPosition);

          animationActions.push(
            new SequenceSimpleAction([
              new FunctionAction(() => {
                entity.register();
                if (animated) {
                  this._reelsEngine.startAnimation(entity, this._iconShowState);
                }
              }),
              new EmptyAction().withDuration(
                animated
                  ? this._iconAnimationHelper.getEntityAnimDuration(entity, this._iconShowState)
                  : 0.0
              ),
              new FunctionAction(() =>
                this._reelsEngine.stopAnimation(entity, this._iconShowState)
              ),
            ])
          );
        }
      }
    }

    if (animationActions.length > 0) {
      const sound = animated ? this._reelsSoundModel.getSoundByName(this._soundName) : null;

      return new SequenceSimpleAction([
        new EmptyAction().withDuration(animated ? this._preFrozenActionDuration : 0.0),
        new FunctionAction(() => {
          if (sound) {
            sound.stop();
            sound.play();
          }
        }),
        new ParallelSimpleAction(animationActions),
      ]);
    }

    return new EmptyAction();
  }

  isLongIcon(drawId: number): boolean {
    return (
      this._reelsSlotGameParams.longIcons.filter((p) => p.iconIndex === Math.floor(drawId / 100))
        .length > 0
    );
  }

  getRandomShortIcon(reel: number): number {
    let icon: number;
    do {
      const index = this._random.nextInt(
        this._gameConfig.staticConfig.spinedReels[reel].length - 1
      );
      icon = this._gameConfig.staticConfig.spinedReels[reel][index];
    } while (this.isLongIcon(icon));

    return icon;
  }
}
