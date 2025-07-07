import { IOperationContextFactory } from './i_operation_context_factory';
import { IocContainer } from '@cgs/shared';
import { IViewContextManager } from './i_view_context_manager';
import { IOperationContext, T_IOperationContext } from '../operations/i_operation_context';

export class OperationContextFactory implements IOperationContextFactory {
  private _container: IocContainer;
  private _viewContextManager: IViewContextManager;

  constructor(viewContextManager: IViewContextManager, container: IocContainer) {
    this._viewContextManager = viewContextManager;
    this._container = container;
  }

  async createOperationContext(showSpinner: boolean = true): Promise<IOperationContext> {
    const viewContext = await this._viewContextManager.createViewContext(showSpinner);
    const operationContext = this._container.resolve<IOperationContext>(T_IOperationContext, [
      viewContext,
    ]);

    return operationContext!;
  }
}
