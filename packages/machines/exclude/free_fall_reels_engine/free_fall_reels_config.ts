import { Vector2 } from 'some-library';
import { IReelsConfig } from 'some-library';

class FreeFallReelsConfig implements IReelsConfig {
  private slotSize: Vector2;
  private slotSizeByReel: Vector2[];
  private symbolSize: Vector2;
  private symbolSizeByReel: Vector2[];
  private reelCount: number;
  private lineCount: number;
  private reelsOffset: Vector2[];
  private offset: Vector2;
  private offsetByReel: Vector2[];

  constructor(
    slotSize: Vector2,
    symbolSize: Vector2,
    reelCount: number,
    lineCount: number,
    reelsOffset: Vector2[],
    offset: Vector2
  ) {
    this.slotSize = slotSize;
    this.symbolSize = symbolSize;
    this.reelCount = reelCount;
    this.lineCount = lineCount;
    this.reelsOffset = reelsOffset;
    this.offset = offset;
  }

  getStartEasing(reelIndex: number): Easing {
    return easeOutSine;
  }

  getStopEasing(reelIndex: number): Easing {
    return easeInSine;
  }

  get iconsCount(): number {
    return this.reelCount * this.lineCount;
  }
}
