import { BonusContext, IBonusRound, IBonusResult, RoundMessage } from '@cgs/common';

export interface IRoundMessageResolver {
  message(
    bonusContext: BonusContext,
    bonusRound: IBonusRound,
    bonusResult: IBonusResult | null
  ): RoundMessage;
  properties(
    bonusContext: BonusContext,
    bonusRound: IBonusRound,
    bonusResult: IBonusResult | null
  ): Map<string, any>;
  roundProperties(bonusContext: BonusContext, bonusRound: IBonusRound): Map<string, any>;
  resultProperties(bonusContext: BonusContext, bonusResult: IBonusResult | null): Map<string, any>;
}
