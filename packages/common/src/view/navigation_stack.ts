import { Func0 } from '@cgs/shared';

export interface IBackHandler {
  handleBackKey(): boolean;
}

export const T_INavigationStack = Symbol('INavigationStack');
export interface INavigationStack extends IBackHandler {
  register(handler: IBackHandler): void;
  unregister(handler: IBackHandler): void;
}

export class NavigationStack implements INavigationStack {
  private _stack: IBackHandler[] = [];

  register(handler: IBackHandler): void {
    this._stack.push(handler);
  }

  unregister(handler: IBackHandler): void {
    const index = this._stack.indexOf(handler);
    if (index !== -1) {
      this._stack.splice(index, 1);
    }
  }

  handleBackKey(): boolean {
    if (this._stack.length <= 1) {
      return false;
    }
    const handler = this._stack[this._stack.length - 1];
    return handler.handleBackKey();
  }
}

export class ActionTaskBackKeyHandler implements IBackHandler {
  private _task: Func0<Promise<void>>;
  private _navigationStack: INavigationStack;
  private _executing: boolean = false;

  constructor(task: Func0<Promise<void>>, navigationStack: INavigationStack) {
    this._task = task;
    this._navigationStack = navigationStack;
  }

  handleBackKey(): boolean {
    if (!this._executing) {
      this.execute();
    }
    return true;
  }

  async execute(): Promise<void> {
    try {
      this._executing = true;
      await this._task();
    } finally {
      this._navigationStack.unregister(this);
    }
  }
}
