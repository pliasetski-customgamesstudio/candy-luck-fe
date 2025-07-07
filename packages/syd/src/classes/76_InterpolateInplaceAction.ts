import { InterpolateAction } from './24_InterpolateAction';
import { clamp } from './globalFunctions';

export type InterpolateInplaceFunction<T> = (start: T, end: T, t: number, result: T) => void;
export type CloneFunction<T> = (value: T) => T;

export class InterpolateInplaceAction<T> extends InterpolateAction<T> {
  private readonly _clone: CloneFunction<T>;
  private _function: InterpolateInplaceFunction<T>;

  constructor(clone: CloneFunction<T>) {
    super();
    this._clone = clone;
  }

  withInterpolateFunction(func: InterpolateInplaceFunction<T>): InterpolateInplaceAction<T> {
    this._function = func;
    return this;
  }

  updateImpl(_dt: number): void {
    const t = clamp(this.duration > 0.0 ? this.elapsed / this.duration : 1.0, 0.0, 1.0);
    this._function(this._start, this._end, this._timeFunction(t, 0.0, 1.0), this._current);
    this.dispatchValueChange(this._current);
  }

  beginImpl(): void {
    if (!this._function || !this._start || !this._end) {
      throw new Error('Missing required properties');
    }

    this._current = this._clone(this._start);
    this.dispatchValueChange(this._current);
  }

  endImpl(): void {
    if (!this._end) {
      throw new Error('InterpolateInplaceAction: end value must be set before ending.');
    }

    this._current = this._end;
    this.dispatchValueChange(this._current);
  }
}
