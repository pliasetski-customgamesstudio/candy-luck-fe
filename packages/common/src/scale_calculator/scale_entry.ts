import { IScaleEntry } from './i_scale_entry';
import { Rectangle } from './i_scale_calculator';

export class ScaleEntry implements IScaleEntry {
  private _minBounds: Rectangle;
  private _maxBounds: Rectangle;
  private _centerHorizontal: boolean;
  private _centerVertical: boolean;

  get centerHorizontal(): boolean {
    return this._centerHorizontal;
  }

  get centerVertical(): boolean {
    return this._centerVertical;
  }

  get minBounds(): Rectangle {
    return this._minBounds;
  }

  get maxBounds(): Rectangle {
    return this._maxBounds;
  }

  constructor(
    minBounds: Rectangle,
    maxBounds: Rectangle,
    centerHorizontal: boolean,
    centerVertical: boolean
  ) {
    this._minBounds = minBounds;
    this._maxBounds = maxBounds;
    this._centerHorizontal = centerHorizontal;
    this._centerVertical = centerVertical;
  }
}
