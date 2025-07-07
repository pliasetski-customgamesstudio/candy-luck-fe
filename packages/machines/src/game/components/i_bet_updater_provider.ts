import { InternalBet, XtremeBetInfo } from '@cgs/common';
import { EventStream } from '@cgs/syd';

export interface IBetUpdaterProvider {
  bets: InternalBet[];
  configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
  defaultBet: number;
  xtremeBetInfo: XtremeBetInfo;
  updateBets(): Promise<void>;
  updateBetsWithoutLevelUp(): Promise<void>;
  updateConfiguredBets(): Promise<void>;
  betsUpdated: EventStream<void>;
}
