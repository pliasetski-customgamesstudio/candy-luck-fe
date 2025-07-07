import { EventStream, EventStreamSubscription, IntervalAction } from '@cgs/syd';

export class WaitForAction<T> extends IntervalAction {
  private _subscribed: boolean = false;
  private _skip: boolean = false;
  private _eventStream: EventStream<T>;
  private _subscription: EventStreamSubscription<T>;

  constructor(eventStream: EventStream<T>) {
    super();
    this._eventStream = eventStream;
  }

  get isFinished(): boolean {
    return this._skip;
  }

  updateImpl(_dt: number): void {
    // TODO: Implement updateImpl
  }

  private _stopWait(): void {
    this._skip = true;
  }

  beginImpl(): void {
    this.subscribe();
  }

  public subscribe(): void {
    if (!this._subscribed) {
      this._subscription = this._eventStream.listen(() => this._stopWait());
      this._subscribed = true;
    }
  }

  endImpl(): void {
    this._subscription.cancel();
  }
}
