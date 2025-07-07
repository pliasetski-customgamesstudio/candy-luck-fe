import { Rectangle } from './i_scale_calculator';

export interface IScaleEntry {
  centerHorizontal: boolean;
  centerVertical: boolean;
  minBounds: Rectangle;
  maxBounds: Rectangle;
}
