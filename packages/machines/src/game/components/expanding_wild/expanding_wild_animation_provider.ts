import { SceneCommon, InternalRespinSpecGroup, ISpinResponse } from '@cgs/common';
import {
  SceneObject,
  Container,
  ParallelSimpleAction,
  EmptyAction,
  Action,
  FunctionAction,
  IntervalAction,
  SequenceAction,
  ParallelAction,
} from '@cgs/syd';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { GameComponentProvider } from '../game_component_provider';
import { IconsSoundModelComponent } from '../icons_sound_model_component';
import { ResourcesComponent } from '../resources_component';
import {
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_IWinLineStrategyProvider,
  T_ResourcesComponent,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { VisibilityRestoreSystem } from '../../../reels_engine/systems/visibility_restore_system';
import { EntityRemovalSystem } from '../../../reels_engine/systems/entity_removal_system';
import { RegularWinLineWithSubstituteStrategyProvider } from '../win_lines/win_line_strategy_providers/regular_win_line_with_substitute_strategy_provider';

export class ExpandingWildAnimationProvider extends GameComponentProvider {
  private _reelsEngine: ReelsEngine;
  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _symbolMap: Map<number, string>;
  get symbolMap(): Map<number, string> {
    return this._symbolMap;
  }
  private _sceneCommon: SceneCommon;
  get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }
  private _slotIconsHolder: SceneObject;
  get slotIconsHolder(): SceneObject {
    return this._slotIconsHolder;
  }
  private _iconSoundModelComponent: IconsSoundModelComponent;
  private _container: Container;
  private _preExpandActionDuration: number;
  get preExpandActionDuration(): number {
    return this._preExpandActionDuration;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    symbolMap: Map<number, string>,
    marker: string,
    {
      useInStrategy = false,
      preExpandActionDuration = 0.0,
    }: { useInStrategy?: boolean; preExpandActionDuration?: number }
  ) {
    super();
    console.log('load ' + this.constructor.name);
    const gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._slotIconsHolder = gameResourceProvider.slot.findById('icons_holder')!;
    this._iconSoundModelComponent = container.forceResolve(T_IconsSoundModelComponent);
    this._preExpandActionDuration = preExpandActionDuration;

    this._createSystems(marker);

    this.subscribeActions(marker, useInStrategy);

    this._gameStateMachine.accelerate.entered.listen((_): void => {
      const nodesToRemove = this._slotIconsHolder.findAllById(marker);
      nodesToRemove.forEach((e: SceneObject) => {
        e.visible = false;
        this._slotIconsHolder.removeChild(e);
      });
    });
  }

  private subscribeActions(marker: string, useInStrategy: boolean): void {
    if (useInStrategy) {
      this._gameStateMachine.stop.entered.listen((_e): void => {
        this._stateMachineStopEntered(marker);
      });
    } else {
      this._gameStateMachine.stop.addLazyAnimationToBegin(
        () =>
          new ParallelSimpleAction([
            this.preExpandAction(this._gameStateMachine.curResponse, marker),
            this.expandAllAction(this._gameStateMachine.curResponse, marker),
          ])
      );
    }
  }

  private _createSystems(marker: string): void {
    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      marker
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

  private _stateMachineStopEntered(marker: string): void {
    const winLineStrategyProvider =
      this._container.forceResolve<RegularWinLineWithSubstituteStrategyProvider>(
        T_IWinLineStrategyProvider
      );
    const expAction = this.expandAllAction(this._gameStateMachine.curResponse, marker);
    winLineStrategyProvider.expandingAnimationAction =
      expAction instanceof EmptyAction ? null : expAction;
  }

  private preExpandAction(_response: ISpinResponse, _marker: string): Action {
    return new EmptyAction();
  }

  private expandAllAction(response: ISpinResponse, marker: string): IntervalAction {
    const respinGroup =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    if (respinGroup && respinGroup.respinStarted) {
      return new EmptyAction().withDuration(0.0);
    }

    const actions: IntervalAction[] = [];
    const symbolGroups = this.getSpecSymbolGroupsByMarker(response, marker);

    if (symbolGroups && symbolGroups.length > 0) {
      for (let i = 0; i < symbolGroups.length; i++) {
        const symbolActions: IntervalAction[] = [];
        const specialSymbolGroup = symbolGroups[i];
        const pos = specialSymbolGroup.previousPositions![0];
        const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
        const lineIndex = (pos / this._reelsEngine.ReelConfig.reelCount) | 0;
        const drawableAnimationIndex = response.viewReels[reelIndex][lineIndex];

        let sceneName = this._symbolMap.get(drawableAnimationIndex) ?? null;
        if (!sceneName) {
          sceneName = this._symbolMap.values().next().value ?? null;
        }

        const entities = this._reelsEngine.getStopedEntities(reelIndex, lineIndex);
        const scene = this._sceneCommon.sceneFactory.build(sceneName!)!;
        const expandState = scene.stateMachine!.findById('expand_' + lineIndex.toString());

        if (expandState) {
          scene.position = entities[0].get(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
          );
          scene.z = 999;
          scene.id = marker;
          scene.initialize();

          symbolActions.push(
            new FunctionAction(() => this._slotIconsHolder.addChild(scene), false)
          );
          symbolActions.push(
            new FunctionAction(() => entities.forEach(this._reelsEngine.hideEntity))
          );
          symbolActions.push(
            new FunctionAction(() => scene.stateMachine!.switchToState(expandState.name), false)
          );
          symbolActions.push(
            new EmptyAction().withDuration((expandState.enterAction as IntervalAction).duration)
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
      return new SequenceAction([
        new EmptyAction().withDuration(this._preExpandActionDuration),
        new ParallelAction(actions),
      ]);
    }
    return new EmptyAction();
  }
}
