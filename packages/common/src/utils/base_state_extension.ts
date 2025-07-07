import { StateMachine } from '@cgs/syd';

export class BaseStateExtension {
  static switchToState(stateMachine: StateMachine, state: string): void {
    stateMachine.switchToState(state);
  }
}
