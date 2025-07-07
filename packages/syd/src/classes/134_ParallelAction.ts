import { IntervalAction } from './50_IntervalAction';

export class ParallelAction extends IntervalAction {
  private _actions: IntervalAction[];
  private _finished: boolean;

  constructor(actions: IntervalAction[]) {
    super();
    this._actions = actions;
    let duration = 0.0;

    for (let i = 0; i < this._actions.length; ++i) {
      const action = this._actions[i];
      const d = action.duration;

      if (d > duration) {
        duration = d;
      }
    }

    this.withDuration(duration);
  }

  get isFinished(): boolean {
    return this._finished;
  }

  updateImpl(dt: number): void {
    let f = true;

    const actions = this._actions;
    for (let i = 0; i < actions.length; ++i) {
      const a = actions[i];
      a.update(dt);
      f = f && a.isDone;
    }

    this._finished = f;
  }

  beginImpl(): void {
    this._finished = false;

    const actions = this._actions;
    for (let i = 0; i < actions.length; ++i) {
      actions[i].begin();
    }
  }

  endImpl(): void {
    const actions = this._actions;
    for (let i = 0; i < actions.length; ++i) {
      actions[i].end();
    }
    this._finished = true;
  }
}
