import {
  BlendResource,
  Color4,
  Matrix3,
  PrimitivesRenderer,
  Rect,
  IResourceCache,
  SceneObject,
  SpriteBatch,
  Vector2,
} from '@cgs/syd';
import { ICoordinateSystemInfoProvider } from '../services/coordinate_system_info_provider';

export class FoggingNode extends SceneObject {
  private _factor: number;
  private _screenSize: Rect;
  private _blend: BlendResource;

  constructor(
    resourceCache: IResourceCache,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    factor: number
  ) {
    super();
    this._factor = factor;
    this._screenSize = coordinateSystemInfoProvider.coordinateSystem;
    this._blend = resourceCache.getResource<BlendResource>(
      BlendResource.TypeId,
      'One_InverseSourceAlpha'
    )!;
  }

  draw(spriteBatch: SpriteBatch): void {
    if (!this.visible) {
      return;
    }

    this._screenSize = new Rect(this.position, new Vector2(3000.0, 3000.0));

    spriteBatch.pushState(this._blend.data);
    PrimitivesRenderer.DrawRect(
      spriteBatch,
      this._screenSize,
      Matrix3.Identity,
      new Color4(0.0, 0.0, 0.0, this._factor)
    );
    spriteBatch.popState(this._blend.data);
  }
}
