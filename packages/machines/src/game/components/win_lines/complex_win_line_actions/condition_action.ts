import { Action, IntervalAction } from '@cgs/syd';

export class ConditionAction extends Action {
  private readonly _condition: () => boolean;
  private _skip: boolean = false;

  constructor(condition: () => boolean) {
    super();
    this._condition = condition;
  }

  beginImpl(): void {}

  endImpl(): void {
    this._skip = true;
  }

  get isFinished(): boolean {
    return this._skip;
  }

  updateImpl(_dt: number): void {
    if (!this._skip) {
      this._skip = this._condition();
    }
  }
}

export class ConditionIntervalAction extends IntervalAction {
  private readonly _condition: () => boolean;
  private _skip: boolean = false;

  constructor(condition: () => boolean) {
    super();
    this._condition = condition;
  }

  beginImpl(): void {}

  endImpl(): void {}

  get isFinished(): boolean {
    return this._skip || super.isFinished;
  }

  updateImpl(_dt: number): void {
    if (!this._skip) {
      this._skip = this._condition();
    }
  }
}
