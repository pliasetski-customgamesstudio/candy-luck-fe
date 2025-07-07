import { Rule } from './125_Rule';
import { State } from './208_State';

export class RuleEntry {
  readonly rule: Rule;
  readonly state: State;

  constructor(rule: Rule, state: State) {
    this.rule = rule;
    this.state = state;
  }
}
