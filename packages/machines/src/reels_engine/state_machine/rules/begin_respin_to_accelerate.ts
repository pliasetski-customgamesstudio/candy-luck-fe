import { ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { AccelerateState } from '../states/accelerate_state';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';
import { CgsEvent } from '@cgs/syd';

export class BeginRespinToAccelerate<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  dispatchEvent(_event: CgsEvent): void {
    this.triggered = this.ruleCondition(this.responseHolder) && this.sourceState.isFinished;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return true;
  }

  setActive(active: boolean): void {
    if (active) {
      const target = this.targetState as AccelerateState<TResponse>;
      if (target) {
        target.skipNetworkRequest = true;
      }
    }
    this.triggered = false;
  }

  update(_dt: number): void {
    this.triggered = this.ruleCondition(this.responseHolder) && this.sourceState.isFinished;
  }
}
