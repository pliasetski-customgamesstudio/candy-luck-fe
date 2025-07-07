import { IScaleEntry } from './i_scale_entry';
import { Rectangle, RectangleProvider } from './i_scale_calculator';

export class DynamicScaleEntry implements IScaleEntry {
  private _centerHorizontal: boolean;
  private _centerVertical: boolean;

  private _minBounds: RectangleProvider;
  private _maxBounds: RectangleProvider;

  get centerHorizontal(): boolean {
    return this._centerHorizontal;
  }

  get centerVertical(): boolean {
    return this._centerVertical;
  }

  get minBounds(): Rectangle {
    return this._minBounds();
  }

  get maxBounds(): Rectangle {
    return this._maxBounds();
  }

  constructor(
    minBounds: RectangleProvider,
    maxBounds: RectangleProvider,
    centerHorizontal: boolean,
    centerVertical: boolean
  ) {
    this._minBounds = minBounds;
    this._maxBounds = maxBounds;
    this._centerHorizontal = centerHorizontal;
    this._centerVertical = centerVertical;
  }
}
