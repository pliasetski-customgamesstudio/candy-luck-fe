import { IAnimationFactory } from './i_animation_factory';
import { ICoordinateSystemInfoProvider } from '../../services/coordinate_system_info_provider';
import { IAnimation } from './i_animation';
import { SceneObject } from '@cgs/syd';
import { DefaultShowAnimation } from './default_show_animation';
import { NonDisposableHideAnimation } from './non_disposable_hide_animation';

export class NonDisposableAnimationFactory implements IAnimationFactory {
  private readonly _coordinateSystemProvider: ICoordinateSystemInfoProvider;

  constructor(coordinateSystemProvider: ICoordinateSystemInfoProvider) {
    this._coordinateSystemProvider = coordinateSystemProvider;
  }

  createShowAnimation(parent: SceneObject, child: SceneObject): IAnimation {
    return new DefaultShowAnimation(parent, child, this._coordinateSystemProvider);
  }

  createHideAnimation(parent: SceneObject, child: SceneObject): IAnimation {
    return new NonDisposableHideAnimation(parent, child, this._coordinateSystemProvider);
  }

  createReplaceAnimation(
    _parent: SceneObject,
    _oldChild: SceneObject,
    _newChild: SceneObject
  ): IAnimation {
    throw new Error('Not implemented');
  }
}
