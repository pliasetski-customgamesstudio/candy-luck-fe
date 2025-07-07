import { Vector2 } from '@cgs/syd';

export class ScaleInfo {
  scale: Vector2;
  position: Vector2;

  constructor(scale: Vector2, position: Vector2) {
    this.scale = scale;
    this.position = position;
  }
}
