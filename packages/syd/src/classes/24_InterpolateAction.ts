import { ValueAction } from './144_ValueAction';
import { TimeFunction } from './33_TimeFunctionBuilder';

export abstract class InterpolateAction<T> extends ValueAction<T> {
  protected _start: T;
  protected _end: T;

  protected _current: T;

  _timeFunction: TimeFunction = (time, _start, _dx) => time;

  get current(): T {
    return this._current;
  }

  get endValue(): T {
    return this._end;
  }

  get startValue(): T {
    return this._start;
  }

  withValues(start: T, end: T): this {
    this._start = start;
    this._end = end;
    return this;
  }

  withTimeFunction(func: TimeFunction): this {
    this._timeFunction = func;
    return this;
  }
}
