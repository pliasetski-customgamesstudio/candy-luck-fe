import { IntervalAction } from '@cgs/syd';

export class AwaitableAction extends IntervalAction {
  private _isFinished: boolean = false;

  get isFinished(): boolean {
    return this._isFinished;
  }

  constructor(future: Promise<any>) {
    super();
    future.then(() => {
      this._isFinished = true;
    });
  }

  beginImpl(): void {}

  endImpl(): void {}

  updateImpl(dt: number): void {}
}
