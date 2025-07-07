import { Color4 } from './10_Color4';
import { Vector2 } from './15_Vector2';

export class SpriteVertex {
  static empty(): SpriteVertex {
    const pos = new Vector2(0.0, 0.0);
    const uv = new Vector2(0.0, 0.0);
    const color = new Color4(0.0, 0.0, 0.0, 0.0);
    return new SpriteVertex(pos, uv, color);
  }

  pos: Vector2;
  uv: Vector2;
  color: Color4;

  constructor(pos: Vector2, uv: Vector2, color: Color4) {
    this.pos = pos;
    this.uv = uv;
    this.color = color;
  }
}
