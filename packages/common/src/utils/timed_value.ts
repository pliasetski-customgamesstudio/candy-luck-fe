export class TimedValue<T> {
  private readonly _time: Date;
  private readonly _value: T;

  constructor(time: Date, value: T) {
    this._time = time;
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  get time(): Date {
    return this._time;
  }

  get epochTime(): Date {
    return new Date(this._time.toUTCString());
  }
}
