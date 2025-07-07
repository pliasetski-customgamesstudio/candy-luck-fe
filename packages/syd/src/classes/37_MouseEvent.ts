import { Vector2 } from './15_Vector2';

export class CGSMouseEvent {
  location: Vector2;
  time: number;

  constructor(location: Vector2, time: number) {
    this.location = location;
    this.time = time;
  }
}
