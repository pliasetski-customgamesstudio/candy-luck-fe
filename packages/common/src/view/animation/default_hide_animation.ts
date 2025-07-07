import { ShowHideAnimationBase } from './show_hide_animation_base';
import { Action, ActionFactory, SceneObject, Vector2 } from '@cgs/syd';
import { ICoordinateSystemInfoProvider } from '../../services/coordinate_system_info_provider';
import { NodeUtils } from '@cgs/shared';

export class DefaultHideAnimation extends ShowHideAnimationBase {
  constructor(
    parent: SceneObject,
    child: SceneObject,
    coordinateSystemProvider: ICoordinateSystemInfoProvider
  ) {
    super(parent, child, coordinateSystemProvider);
  }

  afterRestore(): void {
    this.Parent.removeChild(this.Child!);
    this.Child?.deinitialize();
    NodeUtils.traverseAll(this.Child!, (disp) => {
      disp.dispose();
    });
    this.Child = null;
  }

  createAction(): Action {
    const action = ActionFactory.CreateInterpolateDouble().withValues(1.0, 0.0).withDuration(0.3);
    action.valueChange.listen((value?: number) => {
      this.AnimationSceneObject!.scale = new Vector2(value!, value!);
    });
    return action;
  }
}
