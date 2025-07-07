import { VerticesHolder } from './119_VerticesHolder';
import { PolylineData } from './204_PolylineData';
import { SpriteVertex } from './115_SpriteVertex';
import { PolylineItem } from './179_PolylineItem';

export class Polyline {
  private _verticesHolder: VerticesHolder = new VerticesHolder();
  private _lineWidth: number;
  private _lineData: PolylineData;
  private _isClosed: boolean;

  constructor(lineData: PolylineData, lineWidth: number, isClosed: boolean = false) {
    this._lineData = lineData;
    this._lineWidth = lineWidth;
    this._isClosed = isClosed;
    this.updateAll();
  }

  get width(): number {
    return this._lineWidth;
  }

  set width(value: number) {
    this._lineWidth = value;
    this.updateAll();
  }

  get data(): PolylineData {
    return this._lineData;
  }

  set data(value: PolylineData) {
    this._lineData = value;
    this.updateAll();
  }

  get vertices(): SpriteVertex[] {
    return this._verticesHolder.vertices;
  }

  private updateAll(): void {
    const length: number = this._lineData.length - 1;
    this._verticesHolder.clear();
    const items: PolylineItem[] = [];
    for (let i = 0; i < length; ++i) {
      const item: PolylineItem = PolylineItem.empty();
      item.update(this._lineData.get(i), this._lineData.get(i + 1), this._lineWidth);
      items.push(item);
    }

    for (let i = 0; i < length - 1; ++i) {
      PolylineItem.correct(items[i], items[i + 1]);
    }
    if (this._isClosed) {
      PolylineItem.correct(items[length - 1], items[0]);
    }
    for (let i = 0; i < length; ++i) {
      this._verticesHolder.add(items[i]);
    }
  }
}
