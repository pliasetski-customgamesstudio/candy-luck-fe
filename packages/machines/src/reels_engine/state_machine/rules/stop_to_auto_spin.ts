import { FreeSpinsInfoConstants } from '../free_spins_info_constants';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { ResumeRule } from './infra/resume_rule';
import { ISpinResponse } from '@cgs/common';
import { ISpinParams } from '../../game_components/i_spin_params';

export class StopToAutoSpin<TResponse extends ISpinResponse> extends ResumeRule<TResponse> {
  private _spinParams: ISpinParams;

  constructor(
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>,
    spinParams: ISpinParams
  ) {
    super(sourceState, responseHolder);
    this._spinParams = spinParams;
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return (
      (!resp.curResponse.freeSpinsInfo ||
        resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished) &&
      this._spinParams.autoSpin
    );
  }
}
