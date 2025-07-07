import { ISpinResponse } from '@cgs/common';
import { BaseGameRule } from './base_game_rule';
import { BaseGameState } from '../../states/base_game_state';
import { ResponseHolder } from '../../response_holder';
import { ResumeEvent } from '../../events/resume_event';
import { CgsEvent } from '@cgs/syd';

export class ResumeTransition<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
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
