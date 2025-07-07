import { Vector2 } from './15_Vector2';
import { SpriteBatch } from './248_SpriteBatch';
import { SceneObject } from './288_SceneObject';
import { TextureSource } from './40_TextureSource';
import { Matrix3 } from './57_Matrix3';
import { Rect } from './112_Rect';
import { SceneObjectType } from './SceneObjectType';

export class TextureSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Texture;
  }

  private _source: TextureSource | null = null;
  public offset: Vector2 = Vector2.Zero;
  public dimensionSource: Vector2 | null = null;

  public set source(source: TextureSource | null) {
    this._source = source;
  }

  public get source(): TextureSource | null {
    return this._source;
  }

  public drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    if (!this._source || !this._source.texture) {
      return;
    }

    if (!this.dimensionSource) {
      const texture = this._source.texture;
      this.dimensionSource = new Vector2(texture.width, texture.height);
    }

    spriteBatch.drawOffset(
      this._source.texture,
      Rect.fromSize(this.offset, this.dimensionSource),
      Vector2.Zero,
      transform
    );
  }
}
