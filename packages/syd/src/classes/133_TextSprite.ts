import { Rect } from './112_Rect';
import { Texture } from './41_Texture';

export class TextSprite {
  public readonly rect: Rect;
  private _texture: Texture;

  constructor(texture: Texture, rect: Rect) {
    this._texture = texture;
    this.rect = rect;
  }

  get texture(): Texture {
    return this._texture;
  }
}
