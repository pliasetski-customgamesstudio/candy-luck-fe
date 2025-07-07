import { ISpinResponse } from '@cgs/common';
import { FreeSpinsInfoConstants } from '../free_spins_info_constants';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { ResumeRule } from './infra/resume_rule';

export class ScatterToBeginCustomFreeSpins<
  TResponse extends ISpinResponse,
> extends ResumeRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !resp.curResponse.isBonus &&
      !!resp.curResponse.freeSpinsInfo &&
      (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsStarted ||
        resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsAdded)
    );
  }
}
