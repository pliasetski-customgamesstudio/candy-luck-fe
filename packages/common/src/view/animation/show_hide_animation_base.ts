import { NodeAnimationBase } from './node_animation_base';
import { SceneObject, Vector2 } from '@cgs/syd';
import { ICoordinateSystemInfoProvider } from '../../services/coordinate_system_info_provider';

export abstract class ShowHideAnimationBase extends NodeAnimationBase {
  private _child: SceneObject | null;
  get Child(): SceneObject | null {
    return this._child;
  }
  set Child(value: SceneObject | null) {
    this._child = value;
  }

  get AnimationSceneObject(): SceneObject | null {
    return this._animationSceneObject;
  }
  private _animationSceneObject: SceneObject | null;

  private _shouldRemove = false;
  private _shouldAdd = false;

  private _coordinateSystemProvider: ICoordinateSystemInfoProvider;

  constructor(
    parent: SceneObject,
    child: SceneObject,
    coordinateSystemProvider: ICoordinateSystemInfoProvider
  ) {
    super(parent);
    this._child = child;
    this._coordinateSystemProvider = coordinateSystemProvider;
  }

  prepareTree(): void {
    if (this.Child?.parent === this.Parent) {
      this.Parent.removeChild(this.Child);
      this._shouldAdd = true;
    } else {
      this._shouldRemove = true;
    }

    const coordinateSystem = this._coordinateSystemProvider.coordinateSystem;

    this._animationSceneObject = new SceneObject();
    this._animationSceneObject.id = 'AnimationSceneObject';
    this._animationSceneObject.z = this.Child!.z;
    this._animationSceneObject.pivot = new Vector2(
      coordinateSystem.lt.x + coordinateSystem.width / 2,
      coordinateSystem.lt.y + coordinateSystem.height / 2
    );
    this._animationSceneObject.position = this._animationSceneObject.pivot;
    // this._animationSceneObject.size = new Vector2(this.Child.childs[0].size.x, this.Child.childs[0].size.y);
    // this._animationSceneObject.position = this.Child.childs[0].position;

    this._animationSceneObject.addChild(this.Child!);

    this.Parent.addChild(this._animationSceneObject);
  }

  restoreTree(): void {
    this._animationSceneObject?.removeChild(this.Child!);
    this.Parent.removeChild(this._animationSceneObject!);
    this._animationSceneObject?.deinitialize();
    this._animationSceneObject = null;

    if (this._shouldAdd) {
      this.Parent.addChild(this.Child!);
    }
    if (this._shouldRemove && this.Parent.childs.includes(this.Child!)) {
      this.Parent.removeChild(this.Child!);
    }

    this.afterRestore();
  }

  abstract afterRestore(): void;
}
