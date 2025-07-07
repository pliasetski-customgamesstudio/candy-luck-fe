import { Action } from './84_Action';

export class SequenceSimpleAction extends Action {
  private _current: number;
  private _actions: Action[];

  constructor(actions: Action[]) {
    super();
    this._actions = actions;
  }

  get childActions(): Action[] {
    return this._actions;
  }

  get isFinished(): boolean {
    return this._current === this._actions.length - 1 && this._actions[this._current].isDone;
  }

  beginImpl(): void {
    this._current = 0;
    this._actions[this._current].begin();
  }

  updateImpl(dt: number): void {
    let current = this._actions[this._current];
    current.update(dt);

    while (current.isDone && this._current < this._actions.length - 1) {
      this._current++;
      current = this._actions[this._current];
      current.begin();
      current.update(dt);
    }
  }

  endImpl(): void {
    this._actions[this._current].end();

    for (let i = this._current + 1; i < this._actions.length; i++) {
      this._actions[i].begin();
      this._actions[i].end();
    }

    this._current = this._actions.length - 1;
  }
}
