import { DefaultHideAnimation } from './default_hide_animation';
import { SceneObject } from '@cgs/syd';
import { ICoordinateSystemInfoProvider } from '../../services/coordinate_system_info_provider';

export class NonDisposableHideAnimation extends DefaultHideAnimation {
  constructor(
    parent: SceneObject,
    child: SceneObject,
    coordinateSystemProvider: ICoordinateSystemInfoProvider
  ) {
    super(parent, child, coordinateSystemProvider);
  }

  afterRestore(): void {
    this.Parent.removeChild(this.Child!);
  }
}
