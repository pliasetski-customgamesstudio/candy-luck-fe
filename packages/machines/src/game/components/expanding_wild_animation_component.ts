import { SceneCommon, ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import {
  SceneObject,
  Container,
  EmptyAction,
  IntervalAction,
  FunctionAction,
  ParallelAction,
  SequenceAction,
} from '@cgs/syd';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import {
  UpdateEntityCacheSystem,
  UpdateEntityCacheMode,
} from '../../reels_engine/systems/update_entity_cache_system';
import { VisibilityRestoreSystem } from '../../reels_engine/systems/visibility_restore_system';
import {
  T_ResourcesComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_IconsSoundModelComponent,
} from '../../type_definitions';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { IWinLineStrategyProvider } from './win_lines/win_line_strategy_providers/i_win_line_strategy_provider';
import { T_IWinLineStrategyProvider } from '../../type_definitions';
import { RegularWinLineWithSubstituteStrategyProvider } from './win_lines/win_line_strategy_providers/regular_win_line_with_substitute_strategy_provider';

export class ExpandingWildAnimationComponent {
  private _reelEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _symbolMap: Map<number, string>;
  private _sceneCommon: SceneCommon;
  private _slotIconsHolder: SceneObject;
  private _iconSoundModelComponent: IconsSoundModelComponent;
  private _container: Container;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    symbolMap: Map<number, string>,
    marker: string,
    useInStrategy: boolean = false
  ) {
    console.log('load ' + this.constructor.name);
    const gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._slotIconsHolder = gameResourceProvider.slot.findById('icons_holder')!;
    this._iconSoundModelComponent = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    );

    this._createSystems(marker);

    if (useInStrategy) {
      this._gameStateMachine.stop.entered.listen(() => {
        this._stateMachineStopEntered(marker);
      });
    } else {
      this._gameStateMachine.stop.addLazyAnimationToBegin(() =>
        this.ExpandAllAction(this._gameStateMachine.curResponse, marker)
      );
    }

    this._gameStateMachine.accelerate.entered.listen(() => {
      const nodesToRemove = this._slotIconsHolder.findAllById(marker);
      nodesToRemove.forEach((e) => {
        e.visible = false;
        this._slotIconsHolder.removeChild(e);
      });
    });
  }

  private _createSystems(marker: string) {
    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelEngine.entityEngine,
      this._reelEngine.entityCacheHolder,
      [this._reelEngine.entityEngine.getComponentIndex(marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();

    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelEngine.entityEngine,
      this._reelEngine.internalConfig,
      marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();

    const visibilityRestoreSystem = new VisibilityRestoreSystem(
      this._reelEngine.entityEngine,
      this._reelEngine.entityCacheHolder,
      this._reelEngine.internalConfig
    ).withInitialize();
    visibilityRestoreSystem.updateOrder = 601;
    visibilityRestoreSystem.register();
  }

  private _stateMachineStopEntered(marker: string) {
    const winLineStrategyProvider = this._container.forceResolve<IWinLineStrategyProvider>(
      T_IWinLineStrategyProvider
    ) as RegularWinLineWithSubstituteStrategyProvider;
    const expAction = this.ExpandAllAction(this._gameStateMachine.curResponse, marker);

    winLineStrategyProvider.expandingAnimationAction =
      expAction instanceof EmptyAction ? null : expAction;
  }

  private ExpandAllAction(response: ISpinResponse, marker: string): IntervalAction {
    const respinGroup =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    if (respinGroup && respinGroup.respinStarted) {
      return new EmptyAction().withDuration(0.0);
    }

    const actions: IntervalAction[] = [];
    const symbols = response.specialSymbolGroups;
    const symbolGroups = symbols ? symbols.filter((p) => p.type === marker) : null;

    if (symbolGroups && symbolGroups.length > 0) {
      for (let i = 0; i < symbolGroups.length; i++) {
        const symbolActions: IntervalAction[] = [];
        const specialSymbolGroup = symbolGroups[i];
        const pos = specialSymbolGroup!.previousPositions![0];
        const reelIndex = pos % this._reelEngine.ReelConfig.reelCount;
        const lineIndex = Math.floor(pos / this._reelEngine.ReelConfig.reelCount);
        const drawableAnimationIndex = response.viewReels[reelIndex][lineIndex];

        let sceneName = this._symbolMap.get(drawableAnimationIndex);
        if (!sceneName) {
          sceneName = this._symbolMap.values().next().value;
        }

        const entities = this._reelEngine.getStopedEntities(reelIndex, lineIndex);
        const scene = this._sceneCommon.sceneFactory.build(sceneName!)!;
        const expandState = scene.stateMachine!.findById('expand_' + lineIndex.toString());
        const defaultState = scene.stateMachine!.findById('default')!;

        if (expandState) {
          scene.position = entities[0].get(
            this._reelEngine.entityEngine.getComponentIndex(ComponentNames.Position)
          );
          scene.z = 999;
          scene.id = marker;
          scene.initialize();

          symbolActions.push(
            new FunctionAction(() => this._slotIconsHolder.addChild(scene), false)
          );
          symbolActions.push(
            new FunctionAction(() => entities.forEach(this._reelEngine.hideEntity))
          );
          symbolActions.push(
            new FunctionAction(() => scene!.stateMachine!.switchToState(expandState.name), false)
          );
          symbolActions.push(
            new EmptyAction().withDuration((expandState.enterAction as IntervalAction).duration)
          );
          symbolActions.push(
            new FunctionAction(() => scene!.stateMachine!.switchToState(defaultState.name))
          );
          symbolActions.push(
            new EmptyAction().withDuration((defaultState!.enterAction as IntervalAction).duration)
          );

          actions.push(
            new ParallelAction([
              new SequenceAction(symbolActions),
              new SequenceAction([
                new FunctionAction(
                  () =>
                    this._iconSoundModelComponent.iconsSoundModel
                      .getIconSound(drawableAnimationIndex)
                      .stop(),
                  false
                ),
                new FunctionAction(
                  () =>
                    this._iconSoundModelComponent.iconsSoundModel
                      .getIconSound(drawableAnimationIndex)
                      .play(),
                  false
                ),
              ]),
            ])
          );
        } else {
          scene.deinitialize();
        }
      }
      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }
}
