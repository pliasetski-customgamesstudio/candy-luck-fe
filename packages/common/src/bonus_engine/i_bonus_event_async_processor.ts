export interface IBonusEventAsyncProcessor {
  processBeforeBonusFinishEvent(): Promise<void>;
  processAfterBonusFinishEvent(): Promise<void>;
  processBeforeBonusUpdatedEvent(): Promise<void>;
}
