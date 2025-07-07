export type SydEventListener<T> = (event: T) => void;

export class EventStream<T> {
  private _dispatching: boolean = false;
  private _subscriptions: EventStreamSubscription<T>[] = [];
  private _subscriptionsToRemove: EventStreamSubscription<T>[] = [];

  listen(onData: SydEventListener<T>): EventStreamSubscription<T> {
    const subscription = new EventStreamSubscription(this, onData);
    this._subscriptions.push(subscription);
    return subscription;
  }

  get first(): Promise<T> {
    return new Promise((resolve) => {
      const subscription = this.listen((data) => {
        subscription.cancel();
        resolve(data as T);
      });
    });
  }

  dispatchEvent(event: T): void {
    this._dispatching = true;

    for (let i = this._subscriptions.length - 1; i >= 0; --i) {
      this._subscriptions[i].eventListener(event);
    }

    this._dispatching = false;

    if (this._subscriptionsToRemove.length > 0) {
      for (let i = 0; i < this._subscriptionsToRemove.length; ++i) {
        const s = this._subscriptionsToRemove[i];
        this._subscriptions = this._subscriptions.filter((sub) => sub !== s);
      }
      this._subscriptionsToRemove = [];
    }
  }

  cancel(eventStreamSubscription: EventStreamSubscription<T>): void {
    if (this._dispatching) {
      this._subscriptionsToRemove.push(eventStreamSubscription);
    } else {
      this._subscriptions = this._subscriptions.filter((sub) => sub !== eventStreamSubscription);
    }
  }
}

export interface IStreamSubscription {
  cancel(): void;
}

export class EventStreamSubscription<T> implements IStreamSubscription {
  private readonly _stream: EventStream<T>;
  private readonly _eventListener: SydEventListener<T>;

  constructor(stream: EventStream<T>, eventListener: SydEventListener<T>) {
    this._stream = stream;
    this._eventListener = eventListener;
  }

  get eventListener(): SydEventListener<T> {
    return this._eventListener;
  }

  cancel(): void {
    this._stream.cancel(this);
  }
}
