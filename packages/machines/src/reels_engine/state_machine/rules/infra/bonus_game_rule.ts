import { ISpinResponse } from '@cgs/common';
import { BaseGameRule } from './base_game_rule';
import { CgsEvent } from '@cgs/syd';
import { BaseGameState } from '../../states/base_game_state';
import { ResponseHolder } from '../../response_holder';
import { BonusGameEvent } from '../../events/bonus_game_event';

export class BonusGameRule<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  dispatchEvent(event: CgsEvent): void {
    this.triggered = event instanceof BonusGameEvent;
    if (this.isTriggered) {
      this.sourceState.interrupt();
    }
  }
}
