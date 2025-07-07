import { Vector2 } from '@cgs/syd';
import { IReelsConfig } from './i_reels_config';

export type Easing = (r: number, x0: number, dx: number) => number;

export class InternalReelsConfig {
  private _reelsConfig: IReelsConfig;
  private _slotSize: Vector2;
  protected _slotSizeByReel: Vector2[];
  private _lineCount: number;
  private _additionalUpLines: number;
  private _additionalBottomLines: number;

  constructor(reelsConfig: IReelsConfig) {
    this._reelsConfig = reelsConfig;
    this._additionalUpLines = Math.round(
      Math.abs(this._reelsConfig.offset.y) / this._reelsConfig.symbolSize.y
    );
    this._additionalBottomLines = this._additionalUpLines;
    this._lineCount =
      Math.round(this._reelsConfig.slotSize.y / this._reelsConfig.symbolSize.y) +
      this._additionalUpLines +
      this._additionalBottomLines;
    this._slotSize = new Vector2(
      this._reelsConfig.slotSize.x,
      this._reelsConfig.symbolSize.y * this._lineCount
    );
    this._slotSizeByReel = [];
    if (this._reelsConfig.symbolSizeByReel) {
      for (let r = 0; r < this._reelsConfig.reelCount; r++) {
        this._slotSizeByReel.push(
          new Vector2(
            this._reelsConfig.slotSize.x,
            this._reelsConfig.symbolSizeByReel[r].y * this._lineCount
          )
        );
      }
    }
  }

  get reelCount(): number {
    return this._reelsConfig.reelCount;
  }

  get lineCount(): number {
    return this._lineCount;
  }

  get additionalLines(): number {
    return this._additionalUpLines + this._additionalBottomLines;
  }

  get additionalBottomLines(): number {
    return this._additionalBottomLines;
  }

  get additionalUpLines(): number {
    return this._additionalUpLines;
  }

  get fps(): number {
    return 60.0;
  }

  get slotSize(): Vector2 {
    return this._slotSize;
  }

  get slotSizeByReel(): Vector2[] {
    return this._slotSizeByReel;
  }

  get symbolSize(): Vector2 {
    return this._reelsConfig.symbolSize;
  }

  get symbolSizeByReel(): Vector2[] {
    return this._reelsConfig.symbolSizeByReel!;
  }

  get reelsOffset(): Vector2[] {
    return this._reelsConfig.reelsOffset;
  }

  get offset(): Vector2 {
    return this._reelsConfig.offset;
  }

  get offsetByReel(): Vector2[] {
    return this._reelsConfig.offsetByReel!;
  }

  getStartEasing(reelIndex: number): Easing {
    return this._reelsConfig.getStartEasing(reelIndex);
  }

  getStopEasing(reelIndex: number): Easing {
    return this._reelsConfig.getStopEasing(reelIndex);
  }
}
