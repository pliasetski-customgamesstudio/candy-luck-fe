import { ISpinResponse } from '@cgs/common';
import { InterruptStateRule } from './interrupt_state_rule';
import { CgsEvent } from '@cgs/syd';
import { BaseGameState } from '../../states/base_game_state';
import { ResponseHolder } from '../../response_holder';
import { ResumeEvent } from '../../events/resume_event';

export class ResumeRule<TResponse extends ISpinResponse> extends InterruptStateRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  eventTest(event: CgsEvent): boolean {
    return event instanceof ResumeEvent;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return true;
  }
}
