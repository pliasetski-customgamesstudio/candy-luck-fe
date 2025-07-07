import { ShowHideAnimationBase } from './show_hide_animation_base';
import { Action, ActionFactory, SceneObject, Vector2 } from '@cgs/syd';
import { ICoordinateSystemInfoProvider } from '../../services/coordinate_system_info_provider';

export class DefaultShowAnimation extends ShowHideAnimationBase {
  constructor(
    parent: SceneObject,
    child: SceneObject,
    coordinateSystemProvider: ICoordinateSystemInfoProvider
  ) {
    super(parent, child, coordinateSystemProvider);
  }

  afterRestore(): void {
    this.Parent.addChild(this.Child!);
  }

  createAction(): Action {
    const action = ActionFactory.CreateInterpolateDouble().withValues(0.0, 1.0).withDuration(0.3);
    action.valueChange.listen((value?: number) => {
      this.AnimationSceneObject!.scale = new Vector2(value!, value!);
    });
    return action;
  }
}
