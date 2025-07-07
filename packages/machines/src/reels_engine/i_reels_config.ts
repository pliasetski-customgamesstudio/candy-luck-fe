import { Vector2 } from '@cgs/syd';
import { ISlotGameConfig } from './game_components/i_slot_game_config';
import { Easing } from './internal_reels_config';

export interface IReelsConfig extends ISlotGameConfig {
  slotSize: Vector2;
  slotSizeByReel: Vector2[] | null;
  symbolSize: Vector2;
  symbolSizeByReel: Vector2[] | null;
  reelCount: number;
  lineCount: number;
  reelsOffset: Vector2[];
  offset: Vector2;
  offsetByReel: Vector2[] | null;

  getStartEasing(reelIndex: number): Easing;

  getStopEasing(reelIndex: number): Easing;
}
