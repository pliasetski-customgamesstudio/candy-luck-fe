import { IntervalAction, EmptyAction } from '@cgs/syd';

export class AfterShortWinLinesActionProvider {
  private _action: IntervalAction;

  constructor(action?: IntervalAction) {
    if (!action) {
      this._action = new EmptyAction().withDuration(0.0);
    } else {
      this._action = action;
    }
  }

  public registerAfterShortWinLineAction(action: IntervalAction): void {
    this._action = action;
  }

  public get afterShortWinLinesAction(): IntervalAction {
    return this._action;
  }
}
