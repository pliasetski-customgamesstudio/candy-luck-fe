import { Action } from '@cgs/syd';

export class PromiseAction extends Action {
  private _promise: Promise<any>;
  private _isFinished = false;

  constructor(promise: Promise<any>) {
    super();
    this._promise = promise;
    this._promise.then(() => {
      this._isFinished = true;
    });
    this._promise.catch((error) => {
      console.error(error);
      this._isFinished = true;
    });
  }

  get isFinished(): boolean {
    return this._isFinished;
  }

  updateImpl(_dt: number): void {}

  beginImpl(): void {}

  endImpl(): void {}
}
