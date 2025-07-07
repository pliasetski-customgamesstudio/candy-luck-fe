import { IntervalAction } from './50_IntervalAction';

export class FunctionAction extends IntervalAction {
  private readonly _function: () => void;
  private readonly _doOnEnd: boolean;
  private _finished: boolean;

  constructor(func: () => void, doOnEnd: boolean = true) {
    super();
    this._function = func;
    this._doOnEnd = doOnEnd;
    this._finished = false;
    this.withDuration(0.0);
  }

  get isFinished(): boolean {
    return this._finished;
  }

  beginImpl(): void {
    this._finished = false;
  }

  updateImpl(_dt: number): void {
    if (!this._finished) {
      this._finished = true;
      this._function();
    }
  }

  endImpl(): void {
    if (!this._finished && this._doOnEnd) {
      this._function();
    }
  }
}
