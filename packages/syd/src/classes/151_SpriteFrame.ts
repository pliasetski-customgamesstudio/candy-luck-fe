import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';

export class SpriteFrame {
  readonly srcRect: Rect;
  readonly offset: Vector2;
  readonly size: Vector2;
  readonly inverseSize: Vector2;

  get width(): number {
    return this.size.x;
  }

  get height(): number {
    return this.size.y;
  }

  get inverseWidth(): number {
    return this.inverseSize.x;
  }

  get inverseHeight(): number {
    return this.inverseSize.y;
  }

  constructor(srcRect: Rect, offset: Vector2, size: Vector2) {
    this.srcRect = srcRect;
    this.offset = offset;
    this.size = size;
    this.inverseSize = new Vector2(1.0 / size.x, 1.0 / size.y);
  }
}
