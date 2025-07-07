import { ISpinResponse } from '@cgs/common';
import { CgsEvent } from '@cgs/syd';
import { InterruptStateRule } from './interrupt_state_rule';
import { ResponseHolder } from '../../response_holder';
import { BaseGameState } from '../../states/base_game_state';
import { StopEvent } from '../../events/stop_event';

export class StopRule<TResponse extends ISpinResponse> extends InterruptStateRule<TResponse> {
  private _ruleConditon: boolean = false;

  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  setActive(active: boolean): void {
    super.setActive(active);
    this._ruleConditon = false;
  }

  eventTest(event: CgsEvent): boolean {
    this._ruleConditon = event instanceof StopEvent;
    return this._ruleConditon;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return this._ruleConditon;
  }
}
