import { ISpinResponse } from '@cgs/common';
import { FreeSpinsInfoConstants } from '../free_spins_info_constants';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';

export class StopToBeginFreeSpinsWithTypes<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  private _types: string[];

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    types: string[]
  ) {
    super(sourceState, responseHolder);
    this._types = types;
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !resp.curResponse.isBonus &&
      !resp.curResponse.isScatter &&
      !!resp.curResponse.freeSpinsInfo &&
      (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsStarted ||
        resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsAdded) &&
      (this._types.some((x) => resp.curResponse.freeSpinsInfo?.currentFreeSpinsGroup?.name === x) ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.PurchasedFreeSpinsGroupName)
    );
  }
}
