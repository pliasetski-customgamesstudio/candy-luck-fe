import { IntervalAction } from './50_IntervalAction';

export class TimedAction extends IntervalAction {
  private _action: IntervalAction;
  private _iteration: number;

  constructor(action: IntervalAction) {
    super();
    this._action = action;
  }

  beginImpl(): void {
    this._iteration = 0;
    this._action.begin();
  }

  updateImpl(dt: number): void {
    this._action.update(dt);

    if (this._action.isDone) {
      this._iteration++;
      this._action.begin();
    }
  }

  endImpl(): void {
    this._action.end();
  }
}
