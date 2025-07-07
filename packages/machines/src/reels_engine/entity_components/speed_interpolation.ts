import { Vector2 } from '@cgs/syd';

type InterpolateFunction<T> = (start: T, end: T, time: number) => T;
type TimeFunction = (time: number, start: number, end: number) => number;

export class SpeedInterpolation {
  private _interpolateFunc: InterpolateFunction<Vector2>;
  private _timeFunc: TimeFunction;
  private _startValue: Vector2;
  private _endValue: Vector2;
  private _curValue: Vector2 = new Vector2(0.0, 0.0);
  private _duration: number;
  private _elapsedTime: number = 0.0;

  withParameters(
    duration: number,
    start: Vector2,
    end: Vector2,
    intFunc: InterpolateFunction<Vector2>
  ): SpeedInterpolation {
    this._duration = duration;
    this._startValue = start.clone();
    this._endValue = end.clone();
    this._interpolateFunc = intFunc;
    return this;
  }

  withTimeFunction(func: TimeFunction): SpeedInterpolation {
    this._timeFunc = func;
    return this;
  }

  get value(): Vector2 {
    return this._curValue;
  }

  step(time: number): void {
    const elapsedTime = this._elapsedTime + time;
    this.update(elapsedTime);
    this._elapsedTime = elapsedTime;
  }

  get isDone(): boolean {
    return this._duration >= 0.0 ? this._elapsedTime >= this._duration : false;
  }

  private update(elapsedTime: number): void {
    if (this._interpolateFunc) {
      let time = 1.0;
      if (this._duration > 0.0) {
        time = Math.min(1.0, elapsedTime / this._duration);
      }
      this._curValue = this._interpolateFunc(
        this._startValue,
        this._endValue,
        this._timeFunc(time, 0.0, 1.0)
      );
    }
  }

  equals(other: SpeedInterpolation): boolean {
    return (
      this._duration === other._duration &&
      this._startValue.equals(other._startValue) &&
      this._endValue.equals(other._endValue) &&
      this._interpolateFunc === other._interpolateFunc &&
      this._timeFunc === other._timeFunc
    );
  }

  get hashCode(): number {
    return (
      this._duration ^ this._startValue.x ^ this._startValue.y ^ this._endValue.x ^ this._endValue.y
    );
  }
}
