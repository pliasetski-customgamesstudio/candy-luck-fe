import { OperationContext } from './operation_context';
import { IDisposable } from '@cgs/syd';

export class ChildCounterSection implements IDisposable {
  private _parent: OperationContext;

  constructor(parent: OperationContext) {
    this._parent = parent;
    this._parent.childContextsCount++;
    this._parent.onChildContextCountChanged();
  }

  dispose(): void {
    this._parent.childContextsCount--;
    this._parent.onChildContextCountChanged();
  }
}
