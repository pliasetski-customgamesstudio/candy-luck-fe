import { Color4 } from './10_Color4';
import { Vector2 } from './15_Vector2';

export class PrimitiveVertex {
  pos: Vector2;
  color: Color4;

  constructor(pos: Vector2, color: Color4) {
    this.pos = pos;
    this.color = color;
  }
}
