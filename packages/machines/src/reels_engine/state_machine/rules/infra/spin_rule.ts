import { InterruptStateRule } from './interrupt_state_rule';
import { CgsEvent } from '@cgs/syd';
import { ISpinResponse } from '@cgs/common';
import { BaseGameState } from '../../states/base_game_state';
import { ResponseHolder } from '../../response_holder';
import { SpinEvent } from '../../events/spin_event';

export class SpinRule<TResponse extends ISpinResponse> extends InterruptStateRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  eventTest(event: CgsEvent): boolean {
    return event instanceof SpinEvent;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return true;
  }
}
