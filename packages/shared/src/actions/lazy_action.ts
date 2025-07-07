import { BuildAction } from './build_action';
import { Action } from '@cgs/syd';

export type LazyActionFactory = () => Action;

export class LazyAction extends BuildAction {
  private readonly _factory: LazyActionFactory;

  constructor(factory: LazyActionFactory) {
    super();
    this._factory = factory;
  }

  buildAction(): Action {
    return this._factory();
  }
}
