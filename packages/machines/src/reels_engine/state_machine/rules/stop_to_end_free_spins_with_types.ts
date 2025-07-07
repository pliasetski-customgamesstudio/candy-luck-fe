import { ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { GameRulesUtils } from './game_state_machine_utils';
import { BaseGameRule } from './infra/base_game_rule';

export class StopToEndFreeSpinsWithTypes<
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
      (GameRulesUtils.isFreeSpinsFinishingWithTypes(resp) ||
        GameRulesUtils.isFreeSpinsFinishEventSkipped(resp))
    );
  }
}
