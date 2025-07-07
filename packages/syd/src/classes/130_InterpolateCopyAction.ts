import { InterpolateAction } from './24_InterpolateAction';
import { SydEventListener } from './22_EventStreamSubscription';
import { clamp } from './globalFunctions';

export type InterpolateFunction<T> = (start: T, end: T, t: number) => T;

export class InterpolateCopyAction<T> extends InterpolateAction<T> {
  public static withParameters<T>(
    duration: number,
    start: T,
    end: T,
    intFunc: InterpolateFunction<T>,
    onData: SydEventListener<T>
  ): InterpolateCopyAction<T> {
    const action = new InterpolateCopyAction<T>();
    action._start = start;
    action._end = end;
    action._function = intFunc;
    action.withDuration(duration);
    action.valueChange.listen(onData);
    return action;
  }

  private _function: InterpolateFunction<T>;

  public withInterpolateFunction(func: InterpolateFunction<T>): InterpolateCopyAction<T> {
    this._function = func;
    return this;
  }

  public updateImpl(_dt: number): void {
    const t = clamp(this.duration > 0.0 ? this.elapsed / this.duration : 1.0, 0.0, 1.0);
    this._current = this._function(this._start, this._end, this._timeFunction(t, 0.0, 1.0));
    this.dispatchValueChange(this._current);
  }

  public beginImpl(): void {
    if (
      !this._function ||
      this._start === null ||
      this._start === undefined ||
      this._end === null ||
      this._end === undefined
    ) {
      // TODO: уточнить, надо ли делать throw new Error
      console.error('Function, start, and end must be set before calling beginImpl');
      // throw new Error('Function, start, and end must be set before calling beginImpl');
    }

    this._current = this._start;
    this.dispatchValueChange(this._current);
  }

  public endImpl(): void {
    this._current = this._end;
    this.dispatchValueChange(this._current);
  }
}
