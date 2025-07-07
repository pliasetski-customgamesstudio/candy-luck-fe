import { IntervalAction, Action } from '@cgs/syd';

export abstract class BuildAction extends IntervalAction {
  private _innerAction: Action | null = null;

  get isFinished(): boolean {
    if (this._innerAction) {
      return this._innerAction.isFinished && super.isFinished;
    }

    return true;
  }

  updateImpl(dt: number): void {
    this._innerAction?.update(dt);
  }

  beginImpl(): void {
    this._innerAction = this.buildAction();
    this._innerAction?.begin();
  }

  endImpl(): void {
    this._innerAction?.end();
  }

  abstract buildAction(): Action;
}
