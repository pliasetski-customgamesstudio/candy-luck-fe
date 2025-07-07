import { Action } from './84_Action';

export class ParallelSimpleAction extends Action {
  private readonly _actions: Action[];
  private _finished: boolean;

  constructor(actions: Action[]) {
    super();
    this._actions = actions;
    this._finished = false;
  }

  get childActions(): Action[] {
    return this._actions;
  }

  get isFinished(): boolean {
    return this._finished;
  }

  updateImpl(dt: number): void {
    let allFinished = true;

    const actions = this._actions;
    for (let i = 0; i < actions.length; ++i) {
      const action = actions[i];
      action.update(dt);
      allFinished = allFinished && action.isDone;
    }

    this._finished = allFinished;
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
