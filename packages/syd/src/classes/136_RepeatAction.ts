import { IntervalAction } from './50_IntervalAction';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export class RepeatAction extends IntervalAction {
  private _loop: EventDispatcher<number> = new EventDispatcher<number>();
  private _repeatFinished: boolean;
  private _action: IntervalAction;
  private _iteration: number;
  private _iterationsCount: number;

  get loop(): EventStream<number> {
    return this._loop.eventStream;
  }

  constructor(action: IntervalAction, iterations: number = 0) {
    super();
    this._action = action;
    this._iterationsCount = iterations;
    this.withDuration(this._action.duration * this._iterationsCount);
  }

  beginImpl(): void {
    this._iteration = 0;
    this._repeatFinished = false;
    this._action.begin();
  }

  updateImpl(dt: number): void {
    this._action.update(dt);

    if (this._action.isDone) {
      if (this._iteration < this._iterationsCount || this._iterationsCount === 0) {
        this._iteration++;
      }

      if (this._iteration !== this._iterationsCount) {
        this._action.begin();
        this._loop.dispatchEvent(this._iteration);
      } else {
        this._repeatFinished = true;
      }
    }
  }

  endImpl(): void {
    this._action.end();
    this._repeatFinished = true;
  }

  get isFinished(): boolean {
    return this._repeatFinished;
  }
}
