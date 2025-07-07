import { Rect } from './112_Rect';
import { Texture } from './41_Texture';

export class VideoSprite {
  private _texture: Texture | null = null;
  public rect: Rect;
  public revision: number;

  constructor(texture: Texture, rect: Rect) {
    this._texture = texture;
    this.rect = rect;
    this.revision = 0;
  }

  get texture(): Texture | null {
    return this._texture;
  }

  set texture(value: Texture | null) {
    this._texture = value;
  }
}
