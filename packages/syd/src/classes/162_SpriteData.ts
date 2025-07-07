import { TextureResource } from './174_TextureResource';
import { SpriteFrame } from './151_SpriteFrame';
import { Texture } from './41_Texture';

export class SpriteData {
  private _texture: TextureResource;
  private _frames: SpriteFrame[];

  constructor(texture: TextureResource, frames: SpriteFrame[]) {
    this._texture = texture;
    this._frames = frames;
  }

  get textureResource(): TextureResource {
    return this._texture;
  }

  get texture(): Texture {
    return this._texture.data!;
  }

  get frames(): SpriteFrame[] {
    return this._frames;
  }
}
