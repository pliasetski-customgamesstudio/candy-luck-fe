import { IBonusGame } from '@cgs/features';
import { IBonusScene } from '@cgs/common';
import { EventStream } from '@cgs/syd';

export interface IMiniGameProvider {
  bonusGame: IBonusGame | null;
  bonusScene: IBonusScene | null;
  onMiniGameShown: EventStream<void>;
  onMiniGameCreated: EventStream<IBonusGame>;
}
