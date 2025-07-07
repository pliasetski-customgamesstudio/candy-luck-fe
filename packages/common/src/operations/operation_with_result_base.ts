import { Completer } from '@cgs/syd';
import { OperationBase } from './operation_base';
import { IOperationWithResult } from './i_operation';
import { IOperationContext } from './i_operation_context';

export abstract class OperationWithResultBase<TResult>
  extends OperationBase
  implements IOperationWithResult<TResult>
{
  private _completer: Completer<TResult> = new Completer<TResult>();
  private _result: TResult;

  constructor(context: IOperationContext) {
    super(context);
    this._completer.promise.then((v) => (this._result = v));
  }

  get result(): TResult {
    return this._result;
  }

  get resultTask(): Promise<TResult> {
    return this._completer.promise;
  }

  complete(result: TResult): void {
    if (!this.isCompleted) {
      this._completer.complete(result);
    }
  }

  completeWithError(exception: Error): void {
    if (!this.isCompleted) {
      this._completer.completeError(exception);
    }
  }

  get isCompleted(): boolean {
    return this._completer.isCompleted;
  }
}

export abstract class SyncOperationWithResultBase<
  TResult,
> extends OperationWithResultBase<TResult> {
  constructor(context: IOperationContext) {
    super(context);
  }

  async execute(): Promise<void> {
    await this.internalExecute();
  }

  abstract internalExecute(): Promise<void>;
}

export abstract class AsyncOperationWithResultBase<
  TResult,
> extends OperationWithResultBase<TResult> {
  constructor(context: IOperationContext) {
    super(context);
  }

  async execute(): Promise<void> {
    try {
      await this.internalExecute();
      await this.resultTask;
    } catch (e) {
      await this.finishExecution();
      throw e;
    }
    await this.finishExecution();
  }

  abstract internalExecute(): Promise<void>;
  abstract finishExecution(): Promise<void>;
}
