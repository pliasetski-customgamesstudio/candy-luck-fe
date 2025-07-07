import { IntervalAction } from './50_IntervalAction';

export class SequenceAction extends IntervalAction {
  private _current: number;
  private _actions: Array<[IntervalAction, number]>;
  public childActions: IntervalAction[];

  constructor(actions: IntervalAction[]) {
    super();
    let duration = 0.0;

    this.childActions = actions;

    this._actions = new Array<[IntervalAction, number]>(actions.length);
    for (let i = 0; i < actions.length; ++i) {
      const action = actions[i];
      const d = action.duration;

      this._actions[i] = [action, duration];
      duration += d;
    }

    this.withDuration(duration);
  }

  get isFinished(): boolean {
    return this._current === this._actions.length - 1 && this._actions[this._current][0].isDone;
  }

  beginImpl(): void {
    this._current = 0;
    this._actions[this._current][0].begin();
  }

  updateImpl(dt: number): void {
    let current = this._actions[this._current];
    current[0].update(dt);

    while (current[0].isDone && this._current < this._actions.length - 1) {
      ++this._current;
      current = this._actions[this._current];
      current[0].begin();

      const elapsed = this.elapsed;
      let dt = elapsed - current[1];
      if (dt < 0.0) {
        dt = 0.0;
      }

      current[0].update(dt);
    }
  }

  endImpl(): void {
    this._actions[this._current][0].end();

    for (let i = this._current + 1; i < this._actions.length; ++i) {
      this._actions[i][0].begin();
      this._actions[i][0].end();
    }

    this._current = this._actions.length - 1;
  }
}
