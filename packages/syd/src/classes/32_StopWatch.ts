export class StopWatch {
  private _start: number | null = null;
  private _stop: number | null = null;

  start(): void {
    this._start = this._now();
    this._stop = null;
  }

  stop(): void {
    this._stop = this._now();
  }

  private _now(): number {
    return new Date().getTime() * 1000;
  }

  get elapsedTicks(): number {
    if (this._start === null) {
      return 0;
    }
    return this._stop === null ? this._now() - this._start : this._stop - this._start;
  }

  /**
   * Returns elapsed microseconds.
   */
  get elapsedMicroseconds(): number {
    return this.elapsedTicks;
  }

  get elapsedMilliseconds(): number {
    return this.elapsedMicroseconds / 1000;
  }

  /**
   * Is currently running?
   */
  get isRunning(): boolean {
    return this._start !== null && this._stop === null;
  }
}
