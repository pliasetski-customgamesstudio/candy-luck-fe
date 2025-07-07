import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';

export class GlyphCache {
  readonly rect: Rect;
  readonly offset: Vector2;

  constructor(rect: Rect, offset: Vector2) {
    this.rect = rect;
    this.offset = offset;
  }
}
