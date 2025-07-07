import { ISpinResponse } from '@cgs/common';
import { FreeSpinsInfoConstants } from '../free_spins_info_constants';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';

export class FreespinRecoveryToMakeRequest<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !!resp.curResponse.specialSymbolGroups &&
      resp.curResponse.specialSymbolGroups.some((x) => x.type == 'madRespin') &&
      !!resp.curResponse.freeSpinsInfo &&
      resp.curResponse.freeSpinsInfo.name == FreeSpinsInfoConstants.FreeFrozenSpinsGroupName
    );
  }
}
