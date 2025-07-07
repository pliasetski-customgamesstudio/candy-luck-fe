import { IBonusResponse } from '@cgs/common';

export interface IBonusExternalEventAsyncProcessor {
  processActionsBeforeBonusClose(bonusResponse: IBonusResponse): Promise<void>;
  processActionsBeforeBonusUpdate(bonusResponse: IBonusResponse): Promise<void>;
  processActionsAfterBonusClose(bonusResponse: IBonusResponse): Promise<void>;
}
