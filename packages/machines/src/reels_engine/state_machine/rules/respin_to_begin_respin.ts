import { InternalRespinSpecGroup, ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';

export class RespinToBeginRespin<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    const respinGroup = resp.curResponse.additionalData as InternalRespinSpecGroup;
    return (
      !!respinGroup &&
      respinGroup.respinStarted &&
      respinGroup.respinCounter < respinGroup.groups.length
    );
  }
}
