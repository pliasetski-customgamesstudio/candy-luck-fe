import { IOperationContext } from '../operations/i_operation_context';

export const T_IOperationContextFactory = Symbol('IOperationContextFactory');
export interface IOperationContextFactory {
  createOperationContext(showSpinner?: boolean): Promise<IOperationContext>;
}
