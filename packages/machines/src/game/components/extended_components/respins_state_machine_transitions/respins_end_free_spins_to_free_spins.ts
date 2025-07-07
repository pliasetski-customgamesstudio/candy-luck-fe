import { ISpinResponse, ErrorLevel } from '@cgs/common';
import { ResumeRule } from '../../../../reels_engine/state_machine/rules/infra/resume_rule';
import { BaseGameState } from '../../../../reels_engine/state_machine/states/base_game_state';
import { ResponseHolder } from '../../../../reels_engine/state_machine/response_holder';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class RespinsEndFreeSpinsToFreeSpins<
  TResponse extends ISpinResponse,
> extends ResumeRule<TResponse> {
  private _freeSpins: string[];

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    freeSpins: string[]
  ) {
    super(sourceState, responseHolder);
    this._freeSpins = freeSpins;
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !resp.curResponse.isBonus &&
      !resp.curResponse.isScatter &&
      ((this.responseHolder.preResponse.isFreeSpins &&
        this.responseHolder.preResponse.freeSpinsInfo?.event !==
          FreeSpinsInfoConstants.FreeSpinsFinished &&
        !resp.curResponse.isFreeSpins) ||
        (!!resp.curResponse.freeSpinsInfo &&
          resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
          this._freeSpins.includes(resp.curResponse.freeSpinsInfo.name) &&
          resp.curResponse.errorLevel !== ErrorLevel.Critical))
    );
  }
}
