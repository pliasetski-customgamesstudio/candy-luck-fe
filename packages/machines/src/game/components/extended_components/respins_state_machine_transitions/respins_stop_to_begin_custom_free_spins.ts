import { ISpinResponse, ErrorLevel } from '@cgs/common';
import { BaseGameRule } from '../../../../reels_engine/state_machine/rules/infra/base_game_rule';
import { BaseGameState } from '../../../../reels_engine/state_machine/states/base_game_state';
import { ResponseHolder } from '../../../../reels_engine/state_machine/response_holder';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class RespinsStopToBeginCustomFreeSpins<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  private _respinsName: string[];

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    respinsName: string[]
  ) {
    super(sourceState, responseHolder);
    this._respinsName = respinsName;
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !resp.curResponse.isBonus &&
      !resp.curResponse.isScatter &&
      !!resp.curResponse.freeSpinsInfo &&
      (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsStarted ||
        resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsAdded ||
        (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
          this._respinsName.includes(resp.curResponse.freeSpinsInfo.name))) &&
      resp.curResponse.errorLevel !== ErrorLevel.Critical
    );
  }
}
