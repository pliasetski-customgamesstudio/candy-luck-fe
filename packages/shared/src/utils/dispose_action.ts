import { IDisposable } from '@cgs/syd';
import { VoidFunc0 } from '../func/func_imp';

export class DisposeAction implements IDisposable {
  private readonly _action: VoidFunc0;

  constructor(action: VoidFunc0) {
    this._action = action;
  }

  dispose(): void {
    this._action();
  }
}

export class DisposeDoubleAction implements IDisposable {
  private readonly _startAction: VoidFunc0;
  private readonly _endAction: VoidFunc0;

  constructor(startAction: VoidFunc0, endAction: VoidFunc0) {
    this._startAction = startAction;
    this._endAction = endAction;
    this._startAction();
  }

  dispose(): void {
    this._endAction();
  }
}
