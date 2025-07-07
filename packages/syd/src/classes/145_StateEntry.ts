import { State } from './208_State';
import { RuleEntry } from './123_RuleEntry';

export class StateEntry {
  state: State;
  rules: RuleEntry[] = [];

  constructor(state: State) {
    this.state = state;
  }
}
