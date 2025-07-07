import { State } from './208_State';
import { Action } from './84_Action';

export class StateLink {
  state: State;
  description: Record<string, any>;
  actions: Action[];

  constructor(state: State, description: Record<string, any>, actions: Action[]) {
    this.state = state;
    this.description = description;
    this.actions = actions;
  }
}
