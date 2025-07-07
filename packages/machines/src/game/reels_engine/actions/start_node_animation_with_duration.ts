import {
  Action,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  SceneObject,
  SequenceSimpleAction,
  StateMachine,
} from '@cgs/syd';
import { BuildAction } from '@cgs/shared';
import { BaseStateExtension } from '@cgs/common';

export class StartNodeAnimationWithDuration extends BuildAction {
  private readonly _node: SceneObject;
  private readonly _state: string;
  private readonly _afterCompletionState: string;

  constructor(node: SceneObject, state: string, afterCompletionState: string = '') {
    super();
    this._node = node;
    this._state = state;
    this._afterCompletionState = afterCompletionState;
  }

  buildAction(): Action {
    const actions: Action[] = [];

    actions.push(
      new FunctionAction(() => {
        BaseStateExtension.switchToState(this._node.stateMachine as StateMachine, this._state);
      })
    );
    actions.push(
      new EmptyAction().withDurationMs(
        (this._node.stateMachine!.findById(this._state)?.enterAction as IntervalAction)
          ?.durationMs ?? 0
      )
    );
    if (this._afterCompletionState) {
      actions.push(
        new FunctionAction(() => {
          BaseStateExtension.switchToState(
            this._node.stateMachine as StateMachine,
            this._afterCompletionState
          );
        })
      );
    }

    return new SequenceSimpleAction(actions);
  }
}
