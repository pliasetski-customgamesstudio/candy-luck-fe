import { Vector2, easeOutSine, easeInOutBack } from '@cgs/syd';
import { IReelsConfig } from '../../reels_engine/i_reels_config';
import { Easing } from '../../reels_engine/internal_reels_config';

export class ReelsConfig implements IReelsConfig {
  private _slotSize: Vector2;
  private _slotSizeByReel: Vector2[] | null;
  private _symbolSize: Vector2;
  private _symbolSizeByReel: Vector2[] | null;
  private _reelCount: number;
  private _lineCount: number;
  private _reelsOffset: Vector2[];
  private _offset: Vector2;
  private _offsetByReel: Vector2[] | null;

  constructor(
    slotSize: Vector2,
    symbolSize: Vector2,
    reelCount: number,
    lineCount: number,
    reelsOffset: Vector2[],
    offset: Vector2,
    slotSizeByReel: Vector2[] | null = null,
    symbolSizeByReel: Vector2[] | null = null,
    offsetByReel: Vector2[] | null = null
  ) {
    this._slotSize = slotSize;
    this._symbolSize = symbolSize;
    this._reelCount = reelCount;
    this._lineCount = lineCount;
    this._reelsOffset = reelsOffset;
    this._offset = offset;
    this._slotSizeByReel = slotSizeByReel;
    this._symbolSizeByReel = symbolSizeByReel;
    this._offsetByReel = offsetByReel;
  }

  getStartEasing(reelIndex: number): Easing {
    return easeOutSine;
  }

  getStopEasing(reelIndex: number): Easing {
    return easeInOutBack;
  }

  get offset(): Vector2 {
    return this._offset;
  }

  get offsetByReel(): Vector2[] | null {
    return this._offsetByReel;
  }

  get lineCount(): number {
    return this._lineCount;
  }

  get symbolSize(): Vector2 {
    return this._symbolSize;
  }

  get symbolSizeByReel(): Vector2[] | null {
    return this._symbolSizeByReel;
  }

  get iconsCount(): number {
    return this._reelCount * this._lineCount;
  }

  get reelsOffset(): Vector2[] {
    return this._reelsOffset;
  }

  get reelCount(): number {
    return this._reelCount;
  }

  get slotSize(): Vector2 {
    return this._slotSize;
  }

  get slotSizeByReel(): Vector2[] | null {
    return this._slotSizeByReel;
  }
}
