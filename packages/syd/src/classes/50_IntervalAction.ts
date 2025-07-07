import { Action } from './84_Action';

export abstract class IntervalAction extends Action {
  private _duration: number = 0.0;

  get duration(): number {
    return this._duration;
  }

  get durationMs(): number {
    return Math.floor(this.duration * 1000);
  }

  public get isFinished(): boolean {
    return this._duration >= 0.0 ? this.elapsed >= this._duration : false;
  }

  withDuration(duration: number): this {
    this._duration = duration;
    return this;
  }

  withDurationMs(durationMs: number): this {
    this._duration = durationMs / 1000.0;
    return this;
  }
}
