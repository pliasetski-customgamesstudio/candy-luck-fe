import { ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { ResumeRule } from './infra/resume_rule';

export class ScatterToMackeRequest<TResponse extends ISpinResponse> extends ResumeRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    return !!resp.curResponse.specialSymbolGroups?.some((x) => x.type === 'madRespin');
  }
}
