import { ISpinResponse } from '@cgs/common';
import { CgsEvent } from '@cgs/syd';
import { StartGambleEvent } from '../events/start_gamble_event';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { InterruptStateRule } from './infra/interrupt_state_rule';

export class StartGambleRule<
  TResponse extends ISpinResponse,
> extends InterruptStateRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  eventTest(event: CgsEvent): boolean {
    return event instanceof StartGambleEvent;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return true;
  }
}
