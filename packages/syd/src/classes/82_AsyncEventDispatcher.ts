import { EventStream } from './22_EventStreamSubscription';

export class AsyncEventDispatcher<T> {
  private eventStream: EventStream<T> = new EventStream<T>();
  // TODO: проверить, возмлжно undefined не нужен
  private events: (T | undefined)[] = [];

  public dispatchEvent(event?: T): void {
    this.events.push(event);
  }

  public flush(): void {
    for (let i = 0; i < this.events.length; ++i) {
      const e = this.events[i] as T;
      this.eventStream.dispatchEvent(e);
    }

    this.events = [];
  }
}
