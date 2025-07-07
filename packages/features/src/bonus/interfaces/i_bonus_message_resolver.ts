import { BonusScreenMessage, IBonusResponse } from '@cgs/common';

export interface IBonusMessageResolver {
  startBonus(bonusResponse: IBonusResponse): BonusScreenMessage[];

  updateBonus(bonusResponse: IBonusResponse): BonusScreenMessage[];

  addProperties(addProps: { [key: string]: any }): void;

  clearProperties(): void;
}
