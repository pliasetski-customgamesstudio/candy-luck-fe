import { IAnimation } from './i_animation';
import { VoidFunc0 } from '@cgs/shared';

export class ActionAnimation implements IAnimation {
  private readonly _action: VoidFunc0;

  constructor(action: VoidFunc0) {
    this._action = action;
  }

  public play(): Promise<void> {
    this._action();
    return Promise.resolve();
  }
}
