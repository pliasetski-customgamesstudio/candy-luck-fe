import { Action, FunctionAction, SceneObject, StateMachine } from '@cgs/syd';
import { BuildAction } from '@cgs/shared';
import { BaseStateExtension } from '@cgs/common';

export class ChangeStateAction extends BuildAction {
  private readonly _state: string;
  private readonly _node: SceneObject;

  constructor(node: SceneObject, state: string) {
    super();
    this._node = node;
    this._state = state;
  }

  buildAction(): Action {
    return new FunctionAction(() => {
      BaseStateExtension.switchToState(this._node.stateMachine as StateMachine, this._state);
    });
  }
}
