import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';

export class Glyph {
  readonly rect: Rect;
  readonly offset: Vector2;
  readonly advance: number;

  constructor(rect: Rect, offset: Vector2, advance: number) {
    this.rect = rect;
    this.offset = offset;
    this.advance = advance;
  }
}
