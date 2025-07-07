import { EventStream, IDisposable, Log, SceneObject } from '@cgs/syd';
import { IOperation } from '../operations/i_operation';
import { VoidFunc0, VoidFunc1 } from '@cgs/shared';
import { ICompositeController, IControllerView } from './i_controller';
import { ISafeHandlerContainer } from './i_safe_handler_container';

type Tuple<T1, T2> = [T1, T2];

export class DisposeAction implements IDisposable {
  constructor(private cancel: () => void) {}
  dispose() {
    this.cancel();
  }
}

export class OperationControllerBase<TOperation extends IOperation, TView extends SceneObject>
  implements IControllerView<TView>, ISafeHandlerContainer
{
  private _operation: TOperation;
  private _view: TView;
  private _handlers: IDisposable[] = [];
  private _oneTimeEvents: Set<number> = new Set();
  private _executingEvents: Set<number> = new Set();
  private _executingTimes: Map<number, Date> = new Map();
  private _eventId: number = 0;
  private _isInitialized: boolean = false;
  private _isStarted: boolean = false;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isStarted(): boolean {
    return this._isStarted;
  }

  get operation(): TOperation {
    return this._operation;
  }

  get view(): TView {
    return this._view;
  }

  get composite(): ICompositeController | undefined {
    return undefined;
  }

  constructor(view: TView, operation: TOperation) {
    this._operation = operation;
    this._view = view;
  }

  async executeSafe(task: () => Promise<void>): Promise<void> {
    await task();
  }

  async executeSafeWithWrapper(
    task: () => Promise<void>,
    wrapper: (task: () => Promise<void>) => () => Promise<void>
  ): Promise<void> {
    try {
      await wrapper(task)();
    } catch (e) {
      Log.Error(`Uprocessed Exception ${e}`);
      throw e;
    }
  }

  onInitialize(): void {}
  onStart(): void {}
  onStop(): void {}
  onAfterHide(): void {}

  wrapSafeHandler(task: () => Promise<void>): () => Promise<void> {
    return task;
  }

  async initialize(): Promise<void> {
    this._isInitialized = true;
    this.onInitialize();
    await this.onInitializeAsync();
  }

  async start(): Promise<void> {
    this._isStarted = true;
    this.onStart();
    await this.onStartAsync();
  }

  async stop(): Promise<void> {
    this._isStarted = false;
    for (const handler of this._handlers) {
      handler.dispose();
    }
    this._handlers = [];

    this.onStop();
    await this.onStopAsync();
  }

  async afterHide(): Promise<void> {
    this.onAfterHide();
    await this.onAfterHideAsync();
  }

  async onStartAsync(): Promise<void> {
    return Promise.resolve();
  }

  async onStopAsync(): Promise<void> {
    return Promise.resolve();
  }

  async onInitializeAsync(): Promise<void> {
    return Promise.resolve();
  }

  async onAfterHideAsync(): Promise<void> {
    return Promise.resolve();
  }

  setupActionEventHandler(
    subscribeStream: EventStream<void>,
    handlerFunc: VoidFunc0,
    once: boolean = false,
    minSpan: number = 0
  ): void {
    const handlerCreateFunc = () => {
      handlerFunc();
      return Promise.resolve();
    };
    const unsubscribe = this.createSafeEventHandler(
      subscribeStream,
      handlerCreateFunc,
      once,
      minSpan
    );
    this._handlers.push(unsubscribe);
  }

  setupActionEventHandlerWithArgs1<T>(
    subscribeStream: EventStream<T>,
    handlerFunc: VoidFunc1<T>,
    once: boolean = false,
    minSpan: number = 0
  ): void {
    const handlerCreateFunc = (arg: T) => {
      handlerFunc(arg);
      return Promise.resolve();
    };
    const unsubscribe = this.createSafeEventHandlerWithArgs1(
      subscribeStream,
      handlerCreateFunc,
      once,
      minSpan
    );
    this._handlers.push(unsubscribe);
  }

  setupEventHandler(
    subscribeStream: EventStream<void>,
    handlerCreateFunc: () => Promise<void>,
    once: boolean = false,
    minSpan: number = 0
  ): void {
    const unsubscribe = this.createSafeEventHandler(
      subscribeStream,
      handlerCreateFunc,
      once,
      minSpan
    );
    this._handlers.push(unsubscribe);
  }

  setupEventHandlerWithArgs1<T>(
    subscribeStream: EventStream<T>,
    handlerCreateFunc: (arg: T) => Promise<void>,
    once: boolean = false,
    minSpan: number = 0
  ): void {
    const unsubscribe = this.createSafeEventHandlerWithArgs1(
      subscribeStream,
      handlerCreateFunc,
      once,
      minSpan
    );
    this._handlers.push(unsubscribe);
  }

  createSafeEventHandler(
    subscribeStream: EventStream<void>,
    handlerCreateFunc: () => Promise<void>,
    once: boolean = false,
    minSpan: number = 0
  ): DisposeAction {
    const eventId = this.initEventId();
    const handler: VoidFunc1<void> = async () => {
      await this._executeHandler(handlerCreateFunc, once, eventId, minSpan);
    };
    const sub = subscribeStream.listen(handler);
    return new DisposeAction(() => sub.cancel());
  }

  createSafeEventHandlerWithArgs1<T>(
    subscribeStream: EventStream<T>,
    handlerCreateFunc: (arg: T) => Promise<void>,
    once: boolean = false,
    minSpan: number = 0
  ): DisposeAction {
    const eventId = this.initEventId();
    const handler: VoidFunc1<T | undefined> = async (e) => {
      await this._executeHandler(() => handlerCreateFunc(e!), once, eventId, minSpan);
    };
    const sub = subscribeStream.listen(handler);
    return new DisposeAction(() => sub.cancel());
  }

  createSafeEventHandlerWithArgs2<T1, T2>(
    subscribeStream: EventStream<Tuple<T1, T2>>,
    handlerCreateFunc: (arg1: T1, arg2: T2) => Promise<void>,
    once: boolean = false,
    minSpan: number = 0
  ): DisposeAction {
    const eventId = this.initEventId();
    const handler: VoidFunc1<Tuple<T1, T2> | undefined> = async (e) => {
      await this._executeHandler(() => handlerCreateFunc(e![0], e![1]), once, eventId, minSpan);
    };
    const sub = subscribeStream.listen(handler);
    return new DisposeAction(() => sub.cancel());
  }

  private initEventId(): number {
    const eventId = ++this._eventId;
    this._oneTimeEvents.delete(eventId);
    return eventId;
  }

  private async _executeHandler(
    handlerCreateFunc: () => Promise<void>,
    once: boolean,
    eventId: number,
    minSpan: number
  ): Promise<void> {
    if (!this._tryStartExecuting(eventId)) {
      return;
    }
    try {
      if (!this._checkMinSpan(eventId, minSpan)) {
        return;
      }
      if (this._onceEventExecuted(once, eventId)) {
        return;
      }
      await this.executeSafeWithWrapper(handlerCreateFunc, this.wrapSafeHandler);
    } finally {
      this._stopExecution(eventId);
    }
  }

  private _stopExecution(eventId: number): void {
    this._executingEvents.delete(eventId);
  }

  private _tryStartExecuting(eventId: number): boolean {
    if (this._executingEvents.has(eventId)) {
      return false;
    }
    this._executingEvents.add(eventId);
    return true;
  }

  private _checkMinSpan(eventId: number, minSpan: number): boolean {
    if (minSpan < 1) {
      return true;
    }
    if (this._executingTimes.has(eventId)) {
      const prevTime = this._executingTimes.get(eventId);
      if (prevTime!.getTime() + minSpan > new Date().getTime()) {
        return false;
      }
    }
    this._executingTimes.set(eventId, new Date());
    return true;
  }

  private _onceEventExecuted(once: boolean, eventId: number): boolean {
    if (once) {
      if (this._oneTimeEvents.has(eventId)) {
        return true;
      }
      this._oneTimeEvents.add(eventId);
    }
    return false;
  }
}
