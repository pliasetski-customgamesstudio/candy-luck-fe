import { IOperationContext } from './i_operation_context';
import { IocContainer } from '@cgs/shared';
import { IOperationContextFactory } from '../view/i_operation_context_factory';
import { IViewContext } from '../view/i_view_context';
import { IViewContextManager } from '../view/i_view_context_manager';
import { IBackHandler, INavigationStack } from '../view/navigation_stack';
import { CancellationTokenSource } from '../future/cancellation_token_source';
import { ScaleManager } from '../scale_calculator/scale_manager';
import { IPopupEvents } from './popup_events';
import { IControllerRegistry } from '../controllers/controller_registry';
import { CancellationToken } from '../future/cancellation_token';
import { EventDispatcher, EventStream, IDisposable } from '@cgs/syd';
import { IOperation } from './i_operation';
import { ChildCounterSection } from './child_counter_section';
import { PopupOperation } from './popup_operation';

export class OperationContext implements IOperationContext, IBackHandler {
  private _childContextsCount: number = 0;

  private readonly _container: IocContainer;
  private readonly _operationContextFactory: IOperationContextFactory;
  private readonly _viewContext: IViewContext;
  private readonly _viewContextManager: IViewContextManager;
  private readonly _navigationStack: INavigationStack;
  private readonly _cancellationTokenSource: CancellationTokenSource =
    new CancellationTokenSource();
  private readonly _scaleManager: ScaleManager;
  private readonly _popupEvents: IPopupEvents;
  private readonly _controllerRegistry: IControllerRegistry;

  constructor(
    viewContext: IViewContext,
    container: IocContainer,
    operationContextFactory: IOperationContextFactory,
    viewContextManager: IViewContextManager,
    navigationStack: INavigationStack,
    scaleManager: ScaleManager,
    popupEvents: IPopupEvents,
    controllerRegistry: IControllerRegistry
  ) {
    this._viewContext = viewContext;
    this._container = container;
    this._operationContextFactory = operationContextFactory;
    this._viewContextManager = viewContextManager;
    this._navigationStack = navigationStack;
    this._scaleManager = scaleManager;
    this._popupEvents = popupEvents;
    this._controllerRegistry = controllerRegistry;

    this._navigationStack.register(this);
  }

  cancel(): void {
    this._cancellationTokenSource.cancel();
  }

  get scaleManager(): ScaleManager {
    return this._scaleManager;
  }

  get controllerRegistry(): IControllerRegistry {
    return this._controllerRegistry;
  }

  get cancelToken(): CancellationToken {
    return this._cancellationTokenSource.token;
  }

  private _childContextCountChangedEventDispatcher: EventDispatcher<number> =
    new EventDispatcher<number>();

  get childContextCountChanged(): EventStream<number> {
    return this._childContextCountChangedEventDispatcher.eventStream;
  }

  get childContextsCount(): number {
    return this._childContextsCount;
  }
  set childContextsCount(value: number) {
    this._childContextsCount = value;
  }

  initOperation<T extends IOperation>(operationType: symbol, positionalParams: object[] = []): T {
    positionalParams.push(this);
    return this._container.resolve(operationType, positionalParams) as T;
  }

  async startChildContext(showSpinner: boolean = true): Promise<IOperationContext> {
    return this._operationContextFactory.createOperationContext(showSpinner);
  }

  onChildContextCountChanged(): void {
    this._childContextCountChangedEventDispatcher.dispatchEvent(this.childContextsCount);
  }

  async startChildOperationByType(
    operationType: symbol,
    positionalParams: object[] = []
  ): Promise<IOperation> {
    this._childContextsCount++;
    this.onChildContextCountChanged();
    const childContext = await this.startChildContext();
    const operation = childContext.initOperation(operationType, positionalParams);
    let childOperation = null;

    try {
      childOperation = await childContext.startOperation(operation);
    } finally {
      childContext.dispose();
      this._childContextsCount--;
      this.onChildContextCountChanged();
    }

    return Promise.resolve(childOperation);
  }

  async startChildOperation(operation: IOperation): Promise<IOperation> {
    this._childContextsCount++;
    this.onChildContextCountChanged();
    const childContext = await this.startChildContext();
    let childOperation = null;

    try {
      childOperation = await childContext.startOperation(operation);
    } finally {
      childContext.dispose();
      this._childContextsCount--;
      this.onChildContextCountChanged();
    }

    return Promise.resolve(childOperation);
  }

  async startOperation(operation: IOperation): Promise<IOperation> {
    let handler: IBackHandler | null = null;

    function implementsIBackHandler(obj: any): obj is IBackHandler {
      return obj && typeof obj.handleBackKey === 'function';
    }

    if (implementsIBackHandler(operation)) {
      handler = operation as IBackHandler;
    }

    if (handler) {
      this._navigationStack.register(handler);
    }
    //await _executionWrapper.beforeExecution(operation);

    try {
      // const operationName = operation.toString();
      // this._startupTimeMetter.startTracking(`ExecuteOperation_${operationName}`);
      await operation.execute();
      // this._startupTimeMetter.stopTracking(`ExecuteOperation_${operationName}`);
    } finally {
      //await _executionWrapper.afterExecution(operation);

      if (handler) {
        this._navigationStack.unregister(handler);
      }

      if (operation instanceof PopupOperation) {
        this._popupEvents.onPopupHidden(operation);
      }
    }
    return Promise.resolve(operation);
  }

  async startOperationByType(
    operationType: symbol,
    positionalParams: any[] = []
  ): Promise<IOperation> {
    const operation = this.initOperation(operationType, positionalParams);
    return this.startOperation(operation);
  }

  async startOperationGeneric<T>(operationType: symbol, positionalParams: any[] = []): Promise<T> {
    const operation = this.initOperation(operationType, positionalParams);
    return (await this.startOperation(operation)) as T;
  }

  get viewContext(): IViewContext {
    return this._viewContext;
  }

  dispose(): void {
    this._navigationStack.unregister(this);
    this._viewContextManager.closeViewContext(this.viewContext);
  }

  startChildCounterSection(): IDisposable {
    return new ChildCounterSection(this);
  }

  handleBackKey(): boolean {
    return true;
  }
}
