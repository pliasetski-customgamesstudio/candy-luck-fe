import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export abstract class Action {
  private _beginning: EventDispatcher<Action> = new EventDispatcher<Action>();
  private _done: EventDispatcher<Action> = new EventDispatcher<Action>();

  private _isDone: boolean = true;
  private _elapsed: number = 0.0;

  get elapsed(): number {
    return this._elapsed;
  }

  get beginning(): EventStream<Action> {
    return this._beginning.eventStream;
  }

  get done(): EventStream<Action> {
    return this._done.eventStream;
  }

  get isDone(): boolean {
    return this._isDone ? this._isDone : this.isFinished;
  }

  abstract get isFinished(): boolean;

  abstract updateImpl(dt: number): void;

  abstract beginImpl(): void;

  abstract endImpl(): void;

  update(dt: number): void {
    if (!this._isDone) {
      this._elapsed += dt;
      this.updateImpl(dt);
      if (this.isFinished) {
        this.end();
      }
    }
  }

  begin(): void {
    this._isDone = false;
    this._elapsed = 0.0;
    this._beginning.dispatchEvent(this);

    this.beginImpl();
  }

  end(): void {
    if (!this._isDone) {
      this.endImpl();

      this._isDone = true;
      this._done.dispatchEvent(this);
    }
  }
}
