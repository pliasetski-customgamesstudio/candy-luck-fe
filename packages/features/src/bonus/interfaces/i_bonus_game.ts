import { BonusFinishedArgs, IBonusResponse, SelectionArgs } from '@cgs/common';
import { EventStream, IDisposable } from '@cgs/syd';

export interface IMiniGameService {
  send(selection: number, roundIndex: number, type: string): Promise<IBonusResponse | null>;
}

export interface IBonusGame extends IDisposable {
  onBonusFinished: EventStream<BonusFinishedArgs>;
  onServerException: EventStream<void>;
  start(bonusResponse: IBonusResponse): void;
  stop(): void;
  finishArgs: BonusFinishedArgs;
  bonusResponse: IBonusResponse;
  addProperties(props: Record<string, any>): void;
  clearProperties(): void;
  sendToServer(e: SelectionArgs): Promise<void>;
}
