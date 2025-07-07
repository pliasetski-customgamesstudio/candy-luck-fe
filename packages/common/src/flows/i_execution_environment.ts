import { IOperationContext } from '../operations/i_operation_context';
import { IServiceProvider } from './i_service_provider';

export interface IExecutionEnvironment extends IServiceProvider {
  get context(): IOperationContext;
}
