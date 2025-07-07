import { CgsEvent } from './12_Event';
import { Action } from './84_Action';

export abstract class Rule {
  abstract get isTriggered(): boolean;

  transition: Action;

  setActive(_active: boolean): void {}

  update(_dt: number): void {}

  dispatchEvent(_event: CgsEvent): void {}
}
