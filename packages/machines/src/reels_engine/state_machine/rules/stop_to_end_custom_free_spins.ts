import { ISpinResponse, ErrorLevel } from '@cgs/common';
import { FreeSpinsInfoConstants } from '../free_spins_info_constants';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';

export class StopToEndCustomFreeSpins<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      (!resp.curResponse.isBonus &&
        !resp.curResponse.isScatter &&
        !!this.responseHolder.preResponse &&
        this.responseHolder.preResponse.isFreeSpins &&
        this.responseHolder.preResponse.freeSpinsInfo?.event !==
          FreeSpinsInfoConstants.FreeSpinsFinished &&
        !resp.curResponse.isFreeSpins) ||
      (!!resp.curResponse.freeSpinsInfo &&
        resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished &&
        resp.curResponse.errorLevel !== ErrorLevel.Critical)
    );
  }
}
