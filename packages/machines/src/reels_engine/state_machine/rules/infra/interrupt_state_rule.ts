import { ISpinResponse } from '@cgs/common';
import { CgsEvent } from '@cgs/syd';
import { BaseGameRule } from './base_game_rule';
import { BaseGameState } from '../../states/base_game_state';
import { ResponseHolder } from '../../response_holder';

export abstract class InterruptStateRule<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  protected constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>
  ) {
    super(sourceState, responseHolder);
  }

  dispatchEvent(event: CgsEvent): void {
    if (this.eventTest(event)) {
      this.sourceState.interrupt();
      if (this.ruleCondition(this.responseHolder)) {
        this.triggered = true;
      }
    }
  }

  abstract eventTest(event: CgsEvent): boolean;
}
