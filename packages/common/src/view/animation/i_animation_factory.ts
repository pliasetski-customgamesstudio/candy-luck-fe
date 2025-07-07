import { SceneObject } from '@cgs/syd';
import { IAnimation } from './i_animation';

export interface IAnimationFactory {
  createShowAnimation(parent: SceneObject, child: SceneObject): IAnimation;
  createHideAnimation(parent: SceneObject, child: SceneObject): IAnimation;
  createReplaceAnimation(
    parent: SceneObject,
    oldChild: SceneObject,
    newChild: SceneObject
  ): IAnimation;
}
