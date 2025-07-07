import { DimensionSource } from './131_DimensionSource';
import { DimensionSourceScale } from './38_DimensionSourceScale';
import { Direction } from './62_Direction';

export class TextRenderParameters {
  letterSpacing: number;
  isApplyKerning: boolean;
  isApplyAdvance: boolean; // for monofont
  advance: number; // for monofont

  isClip: boolean = false;
  dimensionSource: DimensionSource = DimensionSource.Frame;
  dimensionSourceScale: DimensionSourceScale = DimensionSourceScale.Both;
  direction: Direction = Direction.LeftToRight;

  constructor(
    letterSpacing: number = 0,
    isApplyKerning: boolean = false,
    isApplyAdvance: boolean = false,
    advance: number = 0
  ) {
    this.letterSpacing = letterSpacing;
    this.isApplyKerning = isApplyKerning;
    this.isApplyAdvance = isApplyAdvance;
    this.advance = advance;
  }
}
