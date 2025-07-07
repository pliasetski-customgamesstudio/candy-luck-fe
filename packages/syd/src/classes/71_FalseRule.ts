import { Rule } from './125_Rule';

export class FalseRule extends Rule {
  get isTriggered(): boolean {
    return false;
  }
}
