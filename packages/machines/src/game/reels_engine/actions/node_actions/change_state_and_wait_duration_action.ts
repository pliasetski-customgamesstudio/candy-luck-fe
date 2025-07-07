import {
  Action,
  EmptyAction,
  IntervalAction,
  FunctionAction,
  SequenceSimpleAction,
  SceneObject,
} from '@cgs/syd';
import { BuildAction } from '@cgs/shared';

export class ChangeStateAndWaitDurationAction extends BuildAction {
  private readonly _node: SceneObject;
  private readonly _state: string;
  private readonly _afterAnimState: string | null;
  private readonly _multiplierDuration: number;

  constructor(
    node: SceneObject,
    state: string,
    afterAnimState: string | null = null,
    multiplierDuration: number = 1.0
  ) {
    super();
    this._node = node;
    this._state = state;
    this._afterAnimState = afterAnimState;
    this._multiplierDuration = multiplierDuration;
  }

  buildAction(): Action {
    if (!this._node || !this._node.stateMachine) {
      return new EmptyAction().withDurationMs(0);
    }

    const nodeStateDuration =
      (this._node.stateMachine.findById(this._state)?.enterAction as IntervalAction)?.durationMs ??
      0;

    const actions: Action[] = [];

    actions.push(
      new FunctionAction(() => {
        this._node.stateMachine!.switchToState(this._state);
      })
    );
    actions.push(
      new EmptyAction().withDurationMs(Math.floor(nodeStateDuration * this._multiplierDuration))
    );
    if (this._afterAnimState) {
      actions.push(
        new FunctionAction(() => {
          this._node.stateMachine!.switchToState(this._afterAnimState!);
        })
      );
    }

    return new SequenceSimpleAction(actions);
  }
}
