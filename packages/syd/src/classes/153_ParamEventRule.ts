import { Rule } from './125_Rule';
import { CgsEvent } from './12_Event';
import { ParamEvent } from './48_ParamEvent';

export class ParamEventRule<T> extends Rule {
  private _triggered: boolean;
  private readonly _param: T;

  constructor(param: T) {
    super();
    this._triggered = false;
    this._param = param;
  }

  get isTriggered(): boolean {
    return this._triggered;
  }

  dispatchEvent(event: CgsEvent): void {
    if (event instanceof ParamEvent) {
      const pe: ParamEvent<T> = event;
      if (pe.param === this._param) {
        this._triggered = true;
      }
    }
  }

  setActive(_active: boolean): void {
    this._triggered = false;
  }
}
