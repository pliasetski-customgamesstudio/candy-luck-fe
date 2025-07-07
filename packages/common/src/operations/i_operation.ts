import { IOperationContext } from './i_operation_context';

export enum OperationEvents {
  SuspendSounds,
  ResumeSounds,
}

export interface IOperation {
  context: IOperationContext;
  execute(): Promise<void>;
}

export interface IEventHandlerOperation extends IOperation {
  handleEvent(evt: OperationEvents): Promise<void>;
}

export abstract class IErrorSupportOperation {
  abstract completeWithError(exception: Error): void;
}

export abstract class ICompletable {
  abstract get isCompleted(): boolean;
}

export interface IOperationWithResult<TResult>
  extends IOperation,
    IErrorSupportOperation,
    ICompletable {
  get resultTask(): Promise<TResult>;
  get result(): TResult;
  complete(result: TResult): void;
}
