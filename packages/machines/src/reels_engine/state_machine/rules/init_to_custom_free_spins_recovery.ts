import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';
import { ISpinResponse } from '@cgs/common';

export class InitToCustomFreeSpinsRecovery<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !!resp.curResponse.freeSpinsInfo &&
      /*(resp.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted ||
        resp.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsAdded) &&*/
      (resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.count || 0) > 0 &&
      !resp.curResponse.isBonus &&
      !resp.curResponse.isScatter
    );
  }
}
