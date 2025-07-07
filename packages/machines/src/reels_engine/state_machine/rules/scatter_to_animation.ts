import { ISpinResponse } from '@cgs/common';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';
import { ResponseHolder } from '../response_holder';

export class ScatterToAnimation<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !!resp.curResponse.specialSymbolGroups &&
      (resp.curResponse.specialSymbolGroups.some((x) => x.type == 'queen_1') ||
        resp.curResponse.specialSymbolGroups.some((x) => x.type == 'queen_2') ||
        resp.curResponse.specialSymbolGroups.some((x) => x.type == 'queen_3') ||
        resp.curResponse.specialSymbolGroups.some((x) => x.type == 'queen_4'))
    );
  }
}
