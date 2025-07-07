import { ISpinResponse, ErrorLevel } from '@cgs/common';
import { ResponseHolder } from '../../../../reels_engine/state_machine/response_holder';
import { BaseGameRule } from '../../../../reels_engine/state_machine/rules/infra/base_game_rule';
import { BaseGameState } from '../../../../reels_engine/state_machine/states/base_game_state';

export class SpecConditionStopToRegularSpin<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  private _groupNames: string[];

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    groupNames: string[]
  ) {
    super(sourceState, responseHolder);
    this._groupNames = groupNames;
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      !resp.curResponse.isBonus &&
      !resp.curResponse.isScatter &&
      this._groupNames &&
      !!this.responseHolder.curResponse.specialSymbolGroups?.some((g) =>
        this._groupNames.includes(g.type as string)
      ) &&
      !resp.curResponse.freeSpinsInfo &&
      resp.curResponse.errorLevel != ErrorLevel.Critical
    );
  }
}
