import { ReelsEngine } from '../../reels_engine/reels_engine';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SceneObject,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { UiSoundModel } from '../../reels_engine/ui_sound_model';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
  T_UiSoundModelComponent,
} from '../../type_definitions';
import { UiSoundModelComponent } from './ui_sound_model_component';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { StringUtils } from '@cgs/shared';

export class SuspendingWildAnimationComponent {
  private _reelsEngine: ReelsEngine;
  private _animIconsHolderPosition: Vector2;
  private _resourcesComponent: ResourcesComponent;
  private _movingSceneName: string;
  private _sceneCommon: SceneCommon;
  private _uiSoundModel: UiSoundModel;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    movingSceneName: string,
    marker: string
  ) {
    console.log('load ' + this.constructor.name);
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._uiSoundModel =
      container.forceResolve<UiSoundModelComponent>(T_UiSoundModelComponent).uiSoundModel;
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const animIconsHolder = this._resourcesComponent.slot.findById('anim_icons_holder')!;
    this._animIconsHolderPosition = new Vector2(
      animIconsHolder.worldTransform.tx,
      animIconsHolder.worldTransform.ty
    );
    this._resourcesComponent.root.inverseTransform.transformVectorInplace(
      this._animIconsHolderPosition
    );
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;

    gameStateMachine.stop.addLazyAnimationToBegin(() =>
      this.suspendingAction(gameStateMachine.curResponse, marker)
    );
  }

  private suspendingAction(response: ISpinResponse, marker: string): IntervalAction {
    const symbols = response.specialSymbolGroups;
    const symbol = symbols && symbols.length > 0 ? symbols.find((p) => p.type === marker) : null;

    if (symbol && symbol.positions) {
      const actions: IntervalAction[] = [];

      const suspendPosition = symbol.previousPositions![0];
      const reelIndex = suspendPosition % this._reelsEngine.ReelConfig.reelCount;
      const lineIndex = Math.floor(suspendPosition / this._reelsEngine.ReelConfig.reelCount);
      const positionIndex = this._reelsEngine.entityEngine.getComponentIndex(
        ComponentNames.Position
      );
      const entity = this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0];
      const pos = entity.get<Vector2>(positionIndex);

      for (const position of symbol.positions) {
        const symbolActions: IntervalAction[] = [];
        const scene = this._buildMovingScene(suspendPosition);
        const animState = scene.stateMachine!.findById('wild' + position.toString())!;

        symbolActions.push(
          new FunctionAction(() => (scene.position = pos.add(this._animIconsHolderPosition)))
        );
        symbolActions.push(new FunctionAction(() => (scene.visible = true)));
        symbolActions.push(new FunctionAction(() => this._uiSoundModel.featureSound.stop()));
        symbolActions.push(new FunctionAction(() => this._uiSoundModel.featureSound.play()));
        symbolActions.push(animState.enterAction as IntervalAction);
        symbolActions.push(
          new FunctionAction(() => {
            scene.visible = false;
            this._resourcesComponent.slot.removeChild(scene);
          })
        );

        actions.push(new SequenceAction(symbolActions));
      }

      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }

  private _buildMovingScene(position: number): SceneObject {
    const scene = this._sceneCommon.sceneFactory.build(
      StringUtils.format(this._movingSceneName, [position.toString()])
    )!;
    scene.z = 999;
    scene.visible = false;
    scene.initialize();
    this._resourcesComponent.slot.addChild(scene);
    return scene;
  }
}
