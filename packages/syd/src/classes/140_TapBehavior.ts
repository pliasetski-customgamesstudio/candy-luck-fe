import { Vector2 } from './15_Vector2';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export abstract class TapBehavior {
  private _pointTouchDispatcher: EventDispatcher<Vector2> = new EventDispatcher<Vector2>();

  get pointTouch(): EventStream<Vector2> {
    return this._pointTouchDispatcher.eventStream;
  }

  private _pointTouchUpDispatcher: EventDispatcher<Vector2> = new EventDispatcher<Vector2>();

  get pointTouchUp(): EventStream<Vector2> {
    return this._pointTouchUpDispatcher.eventStream;
  }

  abstract onDown(p: Vector2): void;

  abstract onMove(p1: Vector2, p2: Vector2): void;

  abstract onUp(p2: Vector2): void;

  threshold: number;

  doPointTouch(point: Vector2): void {
    this._pointTouchDispatcher.dispatchEvent(point);
  }

  doPointTouchUp(point: Vector2): void {
    this._pointTouchUpDispatcher.dispatchEvent(point);
  }
}
