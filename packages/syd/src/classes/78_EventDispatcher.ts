import { EventStream } from './22_EventStreamSubscription';

export class EventDispatcher<T> {
  public eventStream: EventStream<T> = new EventStream<T>();

  // TODO проверить, возможно убрать необязательный параметр
  dispatchEvent(event?: T): void {
    this.eventStream.dispatchEvent(event as T);
  }
}
