import { IOperation } from './i_operation';
import { IOperationContext } from './i_operation_context';

export abstract class OperationBase implements IOperation {
  private _context: IOperationContext;

  constructor(context: IOperationContext) {
    this._context = context;
    context.cancelToken.register(this.onCancel);
  }

  onCancel(): void {}

  get context(): IOperationContext {
    return this._context;
  }

  abstract execute(): Promise<void>;
}

export abstract class SyncOperationBase extends OperationBase {
  constructor(context: IOperationContext) {
    super(context);
  }

  execute(): Promise<void> {
    this.internalExecute();
    return Promise.resolve();
  }

  abstract internalExecute(): void;
}

export abstract class AsyncOperationBase extends OperationBase {
  constructor(context: IOperationContext) {
    super(context);
  }

  execute(): Promise<void> {
    return this.internalExecute();
  }

  protected abstract internalExecute(): Promise<void>;
}
