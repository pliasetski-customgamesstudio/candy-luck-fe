import { IAnimationFactory } from './i_animation_factory';
import { IAnimation } from './i_animation';
import { SceneObject } from '@cgs/syd';
import { ActionAnimation } from './action_animation';

export class NoAnimationAnimationFactory implements IAnimationFactory {
  createHideAnimation(parent: SceneObject, child: SceneObject): IAnimation {
    return new ActionAnimation(() => {
      parent.removeChild(child);
      child.deinitialize();
    });
  }

  createReplaceAnimation(
    parent: SceneObject,
    oldChild: SceneObject,
    newChild: SceneObject
  ): IAnimation {
    return new ActionAnimation(() => {
      parent.removeChild(oldChild);
      oldChild.deinitialize();
      parent.addChild(newChild);
    });
  }

  createShowAnimation(parent: SceneObject, child: SceneObject): IAnimation {
    return new ActionAnimation(() => parent.addChild(child));
  }
}
