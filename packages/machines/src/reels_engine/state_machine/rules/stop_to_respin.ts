import { ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';

export class StopToRespin<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    const respinGroup =
      resp.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (resp.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    return (
      !!respinGroup &&
      respinGroup.respinStarted &&
      respinGroup.respinCounter < respinGroup.groups.length
    );
  }
}
