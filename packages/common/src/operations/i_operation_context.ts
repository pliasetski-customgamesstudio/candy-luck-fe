import { IDisposable, EventStream } from '@cgs/syd';
import { IOperation } from './i_operation';
import { IControllerRegistry } from '../controllers/controller_registry';
import { IViewContext } from '../view/i_view_context';
import { ScaleManager } from '../scale_calculator/scale_manager';
import { CancellationToken } from '../future/cancellation_token';

export const T_IOperationContext = Symbol('IOperationContext');
export interface IOperationContext extends IDisposable {
  get controllerRegistry(): IControllerRegistry;
  get viewContext(): IViewContext;
  get scaleManager(): ScaleManager;
  get cancelToken(): CancellationToken;
  cancel(): void;

  startChildContext(showSpinner?: boolean): Promise<IOperationContext>;
  initOperation<T extends IOperation>(operationType: any, positionalParams?: any[]): T;

  startOperation(operation: IOperation): Promise<IOperation>;
  startOperationByType(operationType: symbol, positionalParams?: any[]): Promise<IOperation>;
  startOperationGeneric<T>(operationType: symbol, positionalParams?: any[]): Promise<T>;
  // startOperationByTypeForResult(operationType: symbol, positionalParams?: Object[]): Promise<any>;
  // startChildOperationByTypeForResult(operationType: symbol, positionalParams?: Object[]): Promise<any>;

  startChildOperationByType(operationType: symbol, positionalParams?: any[]): Promise<IOperation>;
  startChildOperation(operation: IOperation): Promise<IOperation>;

  get childContextsCount(): number;
  get childContextCountChanged(): EventStream<number>;
  startChildCounterSection(): IDisposable;
}
