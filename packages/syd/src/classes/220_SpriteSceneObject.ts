import { SceneObject } from './288_SceneObject';
import { SpriteResource } from './121_SpriteResource';
import { Matrix3 } from './57_Matrix3';
import { SpriteBatch } from './248_SpriteBatch';
import { SpriteFrame } from './151_SpriteFrame';
import { SceneObjectType } from './SceneObjectType';

export class SpriteSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Sprite;
  }

  protected spriteResource: SpriteResource;
  private _frame: number = 0;

  get frame(): number {
    return this._frame;
  }

  set frame(value: number) {
    this._frame = value;
  }

  constructor(spriteResource: SpriteResource) {
    super();
    this.spriteResource = spriteResource;
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    if (this.spriteResource) {
      const data = this.spriteResource.data;
      if (data) {
        const frameData: SpriteFrame = data.frames[this.frame];
        spriteBatch.drawOffset(data.texture!, frameData.srcRect, frameData.offset, transform);
      }
    }
  }
}
