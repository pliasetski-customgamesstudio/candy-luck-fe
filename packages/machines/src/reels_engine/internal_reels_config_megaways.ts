import { Vector2 } from '@cgs/syd';
import { IReelsConfig } from './i_reels_config';
import { InternalReelsConfig } from './internal_reels_config';

export class InternalReelsConfigMegaways extends InternalReelsConfig {
  constructor(config: IReelsConfig) {
    super(config);
    this._slotSizeByReel = [];
    for (let r = 0; r < config.reelCount; r++) {
      this._slotSizeByReel.push(
        new Vector2(
          config.slotSize.x,
          config.symbolSizeByReel![r].y * (config.lineCount + this.additionalLines)
        )
      );
    }
  }

  get slotSizeByReel(): Vector2[] {
    return this._slotSizeByReel;
  }
}
