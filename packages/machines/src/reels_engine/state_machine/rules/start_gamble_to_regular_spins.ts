import { CgsEvent } from '@cgs/syd';
import { GambleEvent } from '../events/gamble_event';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { InterruptStateRule } from './infra/interrupt_state_rule';
import { ISpinResponse } from '@cgs/common';

export class StartGambleToRegularSpins<
  TResponse extends ISpinResponse,
> extends InterruptStateRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  eventTest(event: CgsEvent): boolean {
    if (event instanceof GambleEvent) {
      return !event.success;
    }

    return false;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return true;
  }
}
