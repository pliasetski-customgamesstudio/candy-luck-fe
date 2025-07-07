import { IAnimationFactory } from './i_animation_factory';
import { ICoordinateSystemInfoProvider } from '../../services/coordinate_system_info_provider';
import { SceneObject } from '@cgs/syd';
import { IAnimation } from './i_animation';
import { ActionAnimation } from './action_animation';
import { NodeUtils } from '@cgs/shared';
import { DefaultShowAnimation } from './default_show_animation';

export class DefaultAnimationFactory implements IAnimationFactory {
  private readonly _coordinateSystemProvider: ICoordinateSystemInfoProvider;

  constructor(coordinateSystemProvider: ICoordinateSystemInfoProvider) {
    this._coordinateSystemProvider = coordinateSystemProvider;
  }

  createHideAnimation(parent: SceneObject, child: SceneObject): IAnimation {
    return new ActionAnimation(() => {
      if (parent.childs.includes(child)) {
        parent.removeChild(child);
      }
      child.deinitialize();
      NodeUtils.traverseAll(child, (disp) => {
        disp.dispose();
      });
    });
  }

  createReplaceAnimation(
    _parent: SceneObject,
    _oldChild: SceneObject,
    _newChild: SceneObject
  ): IAnimation {
    throw new Error('Not implemented');
  }

  createShowAnimation(parent: SceneObject, child: SceneObject): IAnimation {
    return new DefaultShowAnimation(parent, child, this._coordinateSystemProvider);
  }
}
