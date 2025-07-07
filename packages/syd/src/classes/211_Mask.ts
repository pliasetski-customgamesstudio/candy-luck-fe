import { TextureResource } from './174_TextureResource';
import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';
import { Matrix3 } from './57_Matrix3';
import { toRadians } from './globalFunctions';

export class Mask {
  texture: TextureResource;

  private _position: Vector2 = Vector2.Zero;
  private _pivot: Vector2 = Vector2.Zero;

  private _skew: Vector2 = Vector2.Zero;
  private _scale: Vector2 = Vector2.One;

  private _rotation: number = 0.0;

  sourceFrame: Rect = Rect.Empty;
  size: Vector2 = Vector2.Zero;

  private _transform: Matrix3 = Matrix3.undefined();

  private _transformDirty: boolean = true;

  get localTransform(): Matrix3 {
    if (this._transformDirty) {
      Matrix3.Make(
        this._scale,
        toRadians(this._skew.x),
        toRadians(this._skew.y),
        toRadians(this._rotation),
        this._pivot,
        this._position,
        this._transform
      );

      this._transformDirty = false;
    }
    return this._transform;
  }

  worldTransform: Matrix3 = Matrix3.undefined();

  get position(): Vector2 {
    return this._position;
  }

  set position(value: Vector2) {
    this._position = value;
    this._transformDirty = true;
  }

  get pivot(): Vector2 {
    return this._pivot;
  }

  set pivot(value: Vector2) {
    this._pivot = value;
    this._transformDirty = true;
  }

  get skew(): Vector2 {
    return this._skew;
  }

  set skew(value: Vector2) {
    this._skew = value;
    this._transformDirty = true;
  }

  get scale(): Vector2 {
    return this._scale;
  }

  set scale(value: Vector2) {
    this._scale = value;
    this._transformDirty = true;
  }

  get rotation(): number {
    return this._rotation;
  }

  set rotation(value: number) {
    this._rotation = value;
    this._transformDirty = true;
  }

  constructor(texture: TextureResource) {
    this.texture = texture;
  }
}
