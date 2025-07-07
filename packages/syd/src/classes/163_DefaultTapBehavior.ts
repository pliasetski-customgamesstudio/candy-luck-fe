import { TapBehavior } from './140_TapBehavior';
import { Vector2 } from './15_Vector2';

export class DefaultTapBehavior extends TapBehavior {
  private _capture: boolean;

  constructor() {
    super();
    this._capture = false;
  }

  onDown(p: Vector2): void {
    this._capture = true;
    this.doPointTouch(p);
  }

  onMove(p1: Vector2, p2: Vector2): void {
    const v1: number = p1.x - p2.x;
    const v2: number = p1.y - p2.y;
    if (v1 * v1 + v2 * v2 > this.threshold) {
      this._capture = false;
    }
  }

  onUp(p2: Vector2): void {
    if (this._capture) {
      this.doPointTouchUp(p2);
    }
  }
}

export enum HAlignment {
  None,
  Left,
  Center,
  Right,
}

export enum VAlignment {
  None,
  Top,
  Center,
  Bottom,
}
