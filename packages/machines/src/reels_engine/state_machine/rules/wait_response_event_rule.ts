import { ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';

export class WaitResponseEventRule<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  update(_dt: number): void {
    if (
      this.responseHolder.curServerResponse &&
      this.ruleCondition(this.responseHolder) &&
      this.sourceState.isFinished
    ) {
      const response = this.responseHolder.curServerResponse;
      this.responseHolder.curServerResponse = null;
      this.responseHolder.preResponse = this.responseHolder.curResponse;
      this.responseHolder.curResponse = response;
      this.triggered = true;
    }
  }
}
