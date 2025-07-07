import { ISpinResponse, ErrorLevel } from '@cgs/common';
import { BaseGameRule } from '../../../../reels_engine/state_machine/rules/infra/base_game_rule';
import { BaseGameState } from '../../../../reels_engine/state_machine/states/base_game_state';
import { ResponseHolder } from '../../../../reels_engine/state_machine/response_holder';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class RespinsStopToEndCustomFreeSpin<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  private _freeSpinsNames: string[];

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    freeSpinsNames: string[]
  ) {
    super(sourceState, responseHolder);
    this._freeSpinsNames = freeSpinsNames;
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
          (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished ||
            (resp.curResponse.freeSpinsInfo.event ===
              FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
              this._freeSpinsNames.includes(resp.curResponse.freeSpinsInfo.name) &&
              !this._freeSpinsNames.includes(
                this.responseHolder.preResponse.freeSpinsInfo?.name || ''
              ))) &&
          resp.curResponse.errorLevel !== ErrorLevel.Critical))
    );
  }
}
