import { Vector2 } from './15_Vector2';

export class MouseWheel {
  position: Vector2;
  wheelDelta: Vector2;

  constructor(position: Vector2, wheelDelta: Vector2) {
    this.position = position;
    this.wheelDelta = wheelDelta;
  }
}
