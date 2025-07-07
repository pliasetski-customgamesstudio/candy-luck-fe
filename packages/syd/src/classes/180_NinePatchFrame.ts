import { SpriteFrame } from './151_SpriteFrame';
import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';

export class NinePatchFrame extends SpriteFrame {
  ninePatch: Rect;

  constructor(srcRect: Rect, offset: Vector2, size: Vector2, ninePatch: Rect) {
    super(srcRect, offset, size);
    this.ninePatch = ninePatch;
  }
}
