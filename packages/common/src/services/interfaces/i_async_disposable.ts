import { Func0 } from '@cgs/shared';

export interface IAsyncDisposable {
  disposeAsync(): Promise<void>;
}

export class AsyncDisposable implements IAsyncDisposable {
  private readonly _disposeFactory: Func0<Promise<void>>;

  constructor(disposeFactory: Func0<Promise<void>>) {
    this._disposeFactory = disposeFactory;
  }

  disposeAsync(): Promise<void> {
    return this._disposeFactory();
  }
}
