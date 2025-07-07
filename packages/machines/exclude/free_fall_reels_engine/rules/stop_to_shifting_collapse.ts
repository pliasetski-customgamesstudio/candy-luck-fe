import { ISpinResponse } from 'package:machines/src/reels_engine_library';
import { BaseGameRule, BaseGameState, ResponseHolder } from 'package:common/common';

class StopToShiftingCollapse<TResponse extends ISpinResponse> extends BaseGameRule<TResponse> {
  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super(sourceState, responseHolder);
  }

  ruleCondition(resp: ResponseHolder<TResponse>): boolean {
    if (
      !resp.curResponse.additionalData ||
      !(resp.curResponse.additionalData instanceof InternalCollapsingSpecGroup)
    ) {
      return false;
    }
    const response: InternalCollapsingSpecGroup = resp.curResponse
      .additionalData as InternalCollapsingSpecGroup;
    return (
      response &&
      response.groups.length > 0 &&
      response.collapsingCounter != response.groups.length &&
      response.currentRound.type == 'shiftCollapsingGroup'
    );
  }
}
