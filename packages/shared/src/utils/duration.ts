export class Duration {
  static readonly microsecondsPerMillisecond: number = 1000;
  static readonly millisecondsPerSecond: number = 1000;
  static readonly secondsPerMinute: number = 60;
  static readonly minutesPerHour: number = 60;
  static readonly hoursPerDay: number = 24;
  static readonly microsecondsPerSecond: number =
    Duration.microsecondsPerMillisecond * Duration.millisecondsPerSecond;
  static readonly microsecondsPerMinute: number =
    Duration.microsecondsPerSecond * Duration.secondsPerMinute;
  static readonly microsecondsPerHour: number =
    Duration.microsecondsPerMinute * Duration.minutesPerHour;
  static readonly microsecondsPerDay: number = Duration.microsecondsPerHour * Duration.hoursPerDay;
  static readonly millisecondsPerMinute: number =
    Duration.millisecondsPerSecond * Duration.secondsPerMinute;
  static readonly millisecondsPerHour: number =
    Duration.millisecondsPerMinute * Duration.minutesPerHour;
  static readonly millisecondsPerDay: number = Duration.millisecondsPerHour * Duration.hoursPerDay;
  static readonly secondsPerHour: number = Duration.secondsPerMinute * Duration.minutesPerHour;
  static readonly secondsPerDay: number = Duration.secondsPerHour * Duration.hoursPerDay;
  static readonly minutesPerDay: number = Duration.minutesPerHour * Duration.hoursPerDay;
  static readonly zero: Duration = new Duration({ seconds: 0 });

  static fromMilliSeconds(milliseconds: number): Duration {
    return new Duration({ milliseconds });
  }

  private readonly _duration: number;

  constructor({
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
    microseconds = 0,
  }: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    microseconds?: number;
  }) {
    this._duration =
      microseconds +
      Duration.microsecondsPerMillisecond * milliseconds +
      Duration.microsecondsPerSecond * seconds +
      Duration.microsecondsPerMinute * minutes +
      Duration.microsecondsPerHour * hours +
      Duration.microsecondsPerDay * days;
  }

  get Number(): number {
    return this._duration;
  }

  private static _microseconds(microseconds: number): Duration {
    return new Duration({ microseconds: microseconds });
  }

  add(other: Duration): Duration {
    return Duration._microseconds(this._duration + other._duration);
  }

  subtract(other: Duration): Duration {
    return Duration._microseconds(this._duration - other._duration);
  }

  multiply(factor: number): Duration {
    return Duration._microseconds(Math.round(this._duration * factor));
  }

  divide(quotient: number): Duration {
    if (quotient === 0) {
      throw new Error('Integer division by zero');
    }
    return Duration._microseconds(Math.floor(this._duration / quotient));
  }

  lessThan(other: Duration): boolean {
    return this._duration < other._duration;
  }

  greaterThan(other: Duration): boolean {
    return this._duration > other._duration;
  }

  lessThanOrEqual(other: Duration): boolean {
    return this._duration <= other._duration;
  }

  greaterThanOrEqual(other: Duration): boolean {
    return this._duration >= other._duration;
  }

  get inDays(): number {
    return Math.floor(this._duration / Duration.microsecondsPerDay);
  }

  get inHours(): number {
    return Math.floor(this._duration / Duration.microsecondsPerHour);
  }

  get inMinutes(): number {
    return Math.floor(this._duration / Duration.microsecondsPerMinute);
  }

  get inSeconds(): number {
    return Math.floor(this._duration / Duration.microsecondsPerSecond);
  }

  get inMilliseconds(): number {
    return Math.floor(this._duration / Duration.microsecondsPerMillisecond);
  }

  get inMicroseconds(): number {
    return this._duration;
  }

  equals(other: Duration): boolean {
    return other instanceof Duration && this._duration === other.inMicroseconds;
  }

  hashCode(): number {
    return this._duration;
  }

  compareTo(other: Duration): number {
    return this._duration - other._duration;
  }

  toString(): string {
    let microseconds = this.inMicroseconds;
    const sign = microseconds < 0 ? '-' : '';

    const hours = Math.floor(microseconds / Duration.microsecondsPerHour);
    microseconds = microseconds % Duration.microsecondsPerHour;

    if (microseconds < 0) {
      microseconds = -microseconds;
    }

    const minutes = Math.floor(microseconds / Duration.microsecondsPerMinute);
    microseconds = microseconds % Duration.microsecondsPerMinute;

    const minutesPadding = minutes < 10 ? '0' : '';

    const seconds = Math.floor(microseconds / Duration.microsecondsPerSecond);
    microseconds = microseconds % Duration.microsecondsPerSecond;

    const secondsPadding = seconds < 10 ? '0' : '';

    const paddedMicroseconds = microseconds.toString().padStart(6, '0');

    return `${sign}${Math.abs(
      hours
    )}:${minutesPadding}${minutes}:${secondsPadding}${seconds}.${paddedMicroseconds}`;
  }

  get isNegative(): boolean {
    return this._duration < 0;
  }

  abs(): Duration {
    return Duration._microseconds(Math.abs(this._duration));
  }

  negate(): Duration {
    return Duration._microseconds(0 - this._duration);
  }
}
