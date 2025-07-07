import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';
import { ISpinResponse } from '@cgs/common';
import { ISpinParams } from '../../game_components/i_spin_params';

export class ShortWinLinesToRegularSpins<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  private _spinParams: ISpinParams;

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    spinParams: ISpinParams
  ) {
    super(sourceState, responseHolder);
    this._spinParams = spinParams;
  }

  ruleCondition(_resp: ResponseHolder<TResponse>): boolean {
    return !this._spinParams.autoSpin;
  }
}
