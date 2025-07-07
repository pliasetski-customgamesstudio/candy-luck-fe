import { EventStream, IDisposable } from '@cgs/syd';
import { SelectionArgs } from './messaging/selection_args';
import { BonusScreenMessage } from './messaging/bonus_message';

export interface IBonusScene extends IDisposable {
  bonusFinishing: EventStream<void>;
  bonusFinished: EventStream<void>;
  bonusShown: EventStream<void>;
  bonusUpdated: EventStream<void>;
  winStarted: EventStream<void>;
  select: EventStream<SelectionArgs>;
  waitingUserInteraction: boolean;

  queueMessages(messages: BonusScreenMessage[]): void;

  roundIndex(): number;

  serverIndexes(): number[];

  interruptBonus(): void;

  skipBonus(): void;
}
