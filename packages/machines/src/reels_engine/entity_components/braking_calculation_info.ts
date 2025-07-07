import { Vector2 } from '@cgs/syd';

export class BrakingCalculationInfo {
  position: Vector2;
  readonly speed: Vector2;
  constructor(position: Vector2, speed: Vector2) {
    this.position = position;
    this.speed = speed;
  }
}
