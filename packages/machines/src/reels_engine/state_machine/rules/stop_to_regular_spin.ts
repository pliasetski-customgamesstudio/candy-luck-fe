import { ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { GameRulesUtils } from './game_state_machine_utils';
import { BaseGameRule } from './infra/base_game_rule';

export class StopToRegularSpin<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !resp.curResponse.isBonus &&
      !resp.curResponse.isScatter &&
      !GameRulesUtils.isFreeSpins(resp) &&
      !GameRulesUtils.isFreeSpinsFinishEventSkipped(resp)
    );
  }
}
