import { IntervalAction } from './50_IntervalAction';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export abstract class ValueAction<T> extends IntervalAction {
  private _valueChange: EventDispatcher<T> = new EventDispatcher<T>();

  get valueChange(): EventStream<T> {
    return this._valueChange.eventStream;
  }

  dispatchValueChange(val: T): void {
    this._valueChange.dispatchEvent(val);
  }
}
