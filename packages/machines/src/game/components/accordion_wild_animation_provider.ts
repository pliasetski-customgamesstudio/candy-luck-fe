import { ISpinResponse, SceneCommon, SpecialSymbolGroup } from '@cgs/common';
import { GameComponentProvider } from './game_component_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { IIconModel } from '../../reels_engine/i_icon_model';
import { SlotParams } from '../../reels_engine/slot_params';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import {
  Action,
  Completer,
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelSimpleAction,
  ParamEvent,
  SceneObject,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';
import { ComponentIndex } from '../../reels_engine/entities_engine/component_index';
import { SubstituteIconItem } from './substitute_icon_componenent';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IconModelComponent,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../../type_definitions';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconModelComponent } from './icon_model_component';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { DrawOrderConstants } from '../common/slot/views/base_popup_view';
import { StringUtils } from '@cgs/shared';
import { AwaitableAction } from '../../reels_engine/actions/awaitable_action';
import { SubstituteIconSystem } from '../../reels_engine/systems/substitute_icon_system';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import { VisibilityRestoreSystem } from '../../reels_engine/systems/visibility_restore_system';

export class AccordionWildAnimationProvider extends GameComponentProvider {
  private _sceneCommon: SceneCommon;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine;
  private _iconModel: IIconModel;
  private _slotParams: SlotParams;
  private _reelsSoundModel: ReelsSoundModel;
  private _wildScene: SceneObject | null;
  private _listener: SceneObject | null;
  private _positionIndex: ComponentIndex;
  private _animIconsHolder: SceneObject;
  private _substituteSymbols: SubstituteIconItem[];
  private _marker: string;
  private _eventIdPattern: string;
  private _allowPartialSubstitution: boolean;
  private _useLineIndexInSearch: boolean;
  private _takeFirstSubstituteIconIfNull: boolean;
  private _substituteSceneName: string;
  private _substituteStateName: string;
  private _substituteSoundName: string;
  private _featureSoundName: string;

  private _sceneCache: SceneObject[] = [];

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    marker: string,
    wildSceneName: string,
    listenerId: string,
    eventIdPattern: string,
    substituteSymbols: SubstituteIconItem[],
    allowPartialSubstitution: boolean,
    substituteSceneName: string,
    featureSoundName: string,
    substituteSoundName: string,
    substituteStateName: string,
    useLineIndexInSearch: boolean = false,
    takeFirstSubstituteIconIfNull: boolean = true
  ) {
    super();
    this._sceneCommon = sceneCommon;
    this._marker = marker;
    this._eventIdPattern = eventIdPattern;
    this._substituteSymbols = substituteSymbols;
    this._allowPartialSubstitution = allowPartialSubstitution;
    this._substituteSceneName = substituteSceneName;
    this._featureSoundName = featureSoundName;
    this._substituteSoundName = substituteSoundName;
    this._substituteStateName = substituteStateName;
    this._useLineIndexInSearch = useLineIndexInSearch;
    this._takeFirstSubstituteIconIfNull = takeFirstSubstituteIconIfNull;

    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._positionIndex = this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position);
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._slotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    const resourceComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._animIconsHolder = resourceComponent.slot.findById('anim_icons_holder')!;

    this._wildScene = this._sceneCommon.sceneFactory.build(wildSceneName);
    if (this._wildScene) {
      this._wildScene.initialize();
      this._wildScene.visible = this._wildScene.active = true;
      this._wildScene.z = DrawOrderConstants.ProgressiveBonusDrawOrder;
      this._listener = this._wildScene.findById(listenerId);

      resourceComponent.root.addChild(this._wildScene);

      this._gameStateMachine.stop.appendLazyAnimation(() =>this.buildWildAction());

      this.createSystems();
    }
  }

  private buildWildAction = (): Action => {
    const symbols = this._gameStateMachine.curResponse.specialSymbolGroups
      ? this._gameStateMachine.curResponse.specialSymbolGroups.filter(
          (p) => p.type === this._marker
        )
      : null;

    const positions: number[] = [];
    if (symbols) {
      symbols.forEach((s) => positions.push(...s.positions!));
    }
    const reels = this.getReelIndexes(positions);

    if (reels.length === 0) {
      return new EmptyAction();
    }

    const animationActions: Action[] = [];
    for (const reel of reels) {
      const executeTask = new Completer<void>();
      const subscription = this._listener!.eventReceived.listen((e) => {
        if (
          e instanceof ParamEvent &&
          e.param === StringUtils.format(this._eventIdPattern, [reel.toString()])
        ) {
          executeTask.complete();
        }
      });

      animationActions.push(
        new SequenceSimpleAction([
          new AwaitableAction(executeTask.promise),
          this.buildSubstituteIconAction(symbols!, reel),
          new FunctionAction(() => subscription.cancel()),
        ])
      );
    }

    const sound = this._reelsSoundModel.getSoundByName(this._featureSoundName);

    return new SequenceSimpleAction([
      new FunctionAction(() => {
        this._wildScene!.stateMachine!.switchToState('default');
        this._wildScene!.stateMachine!.switchToState('step_0');
        sound.stop();
        sound.play();
      }),
      new ParallelSimpleAction(animationActions),
    ]);
  };

  private buildSubstituteIconAction = (
    symbolGroups: SpecialSymbolGroup[],
    reelIndex: number
  ): Action => {
    if (!symbolGroups) {
      return new EmptyAction();
    }

    const actions: Action[] = [];
    for (const symbolGroup of symbolGroups) {
      const symbolActions: Action[] = [];
      const reelPositions = symbolGroup.positions!.filter(
        (p) => p % this._reelsEngine.ReelConfig.reelCount === reelIndex
      );

      if (reelPositions.length > 0) {
        const scene = this.getWildScene()!;
        const scenePosition = this._reelsEngine
          .getStopedEntities(
            reelIndex,
            Math.floor(
              reelPositions.reduce((a, b) => Math.min(a, b)) /
                this._reelsEngine.ReelConfig.reelCount
            )
          )[0]
          .get<Vector2>(this._positionIndex);
        scene.position = scenePosition;

        const showSceneAction = new FunctionAction(() => this._animIconsHolder.addChild(scene));
        let sceneAnimAction: Action | null = null;

        const substituteState = scene.stateMachine!.findById(this._substituteStateName);
        if (substituteState) {
          const animDuration = (substituteState.enterAction as IntervalAction).duration;
          const sound = this._reelsSoundModel.getSoundByName(this._substituteSoundName);
          sceneAnimAction = new SequenceSimpleAction([
            new FunctionAction(() => {
              scene.stateMachine!.switchToState('default');
              scene.stateMachine!.switchToState(this._substituteStateName);
              sound.stop();
              sound.play();
            }),
            new EmptyAction().withDuration(animDuration),
          ]);
        }

        const sceneRemoveAction = new FunctionAction(() => {
          this._animIconsHolder.removeChild(scene);
          this.putWildScene(scene);
        });

        const showNewEntityActions: Action[] = [];
        const hideOldEntityActions: Action[] = [];
        for (let i = 0; i < reelPositions.length; i++) {
          const pos = reelPositions[i];
          const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);
          const drawId = this._reelsEngine.iconAnimationHelper.getDrawIndexes(pos)[0];

          let substituteItem: SubstituteIconItem | null = null;
          this._substituteSymbols.forEach((x) => {
            if (
              x.symbolId === symbolGroup.symbolId &&
              (!this._useLineIndexInSearch || x.iconDescr.length === symbolGroup.positions!.length)
            ) {
              substituteItem = x;
            }
          });

          if (this._takeFirstSubstituteIconIfNull) {
            substituteItem = !substituteItem ? this._substituteSymbols[0] : substituteItem;
          }

          if (substituteItem) {
            const symbol = substituteItem.iconDescr;

            const longIcon = this._slotParams.longIcons.find(
              (p) => p.iconIndex === Math.floor(drawId / 100)
            );
            const iconLength = longIcon ? longIcon.length : 1;
            const symbolLength = symbol.length;

            const stoppedEntity =
              iconLength > symbolLength || this._allowPartialSubstitution
                ? this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0]
                : this._reelsEngine.iconAnimationHelper.getEntities(pos)[0];

            const hiddedEntity = this._reelsEngine.iconAnimationHelper.getEntities(pos)[0];
            const entityPosition = stoppedEntity.get<Vector2>(this._positionIndex);
            const newEntity = this._reelsEngine.CreateEntity(
              reelIndex,
              lineIndex,
              iconLength > symbolLength ? symbol.iconIndex : symbol.iconIndex + i,
              [symbolGroup.type!]
            );
            newEntity.addComponent(
              ComponentNames.Position,
              new Vector2(entityPosition.x, entityPosition.y)
            );
            newEntity.addComponent(ComponentNames.Visible, false);
            newEntity.register();

            showNewEntityActions.push(
              new FunctionAction(() => newEntity.addComponent(ComponentNames.Visible, true))
            );
            hideOldEntityActions.push(
              new FunctionAction(() => hiddedEntity.addComponent(ComponentNames.Visible, false))
            );
          }
        }

        symbolActions.push(
          new SequenceSimpleAction([
            showSceneAction,
            sceneAnimAction || new EmptyAction(),
            new ParallelSimpleAction(showNewEntityActions),
            sceneRemoveAction,
          ])
        );
      }

      actions.push(new ParallelSimpleAction(symbolActions));
    }
    return new ParallelSimpleAction(actions);
  };

  private createSystems(): void {
    const substituteIconSystem = new SubstituteIconSystem(this._reelsEngine.entityEngine);
    substituteIconSystem.updateOrder = 100;
    substituteIconSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(this._marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();

    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      this._marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();

    const visibilityRestoreSystem = new VisibilityRestoreSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this._reelsEngine.internalConfig
    ).withInitialize();
    visibilityRestoreSystem.updateOrder = 601;
    visibilityRestoreSystem.register();
  }

  private getReelIndexes(positions: number[]): number[] {
    const reels: number[] = [];

    if (positions) {
      for (const position of positions) {
        const reel = this._reelsEngine.getReelByPosition(position);
        if (!reels.includes(reel)) {
          reels.push(reel);
        }
      }
    }

    return reels;
  }

  private getWildScene(): SceneObject | null {
    if (this._sceneCache.length > 0) {
      const scene = this._sceneCache[0];
      this._sceneCache.splice(0, 1);
      return scene;
    }

    return this.buildWildScene();
  }

  private putWildScene(scene: SceneObject): void {
    scene.stateMachine!.switchToState('default');
    this._sceneCache.push(scene);
  }

  private buildWildScene(): SceneObject | null {
    const scene = this._sceneCommon.sceneFactory.build(this._substituteSceneName);
    if (scene) {
      scene.initialize();
      scene.active = scene.visible = true;
      scene.z = 99999;
    }

    return scene;
  }

  public deinitialize(): void {
    this._sceneCache.forEach((scene) => scene.deinitialize());
    this._sceneCache = [];
  }
}
