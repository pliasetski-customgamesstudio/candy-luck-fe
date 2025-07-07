import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';
import { PolylineDataItem } from './94_PolylineDataItem';

export class PolylineData {
  private _points: PolylineDataItem[];

  constructor(points: PolylineDataItem[]) {
    this._points = [...points];
  }

  static withColor(data: PolylineData, color: Color4): PolylineData {
    const res = data.clone();
    res._points.forEach((e) => {
      e.color.r = color.r;
      e.color.g = color.g;
      e.color.b = color.b;
      e.color.a = color.a;
    });
    return res;
  }

  get points(): PolylineDataItem[] {
    return this._points;
  }

  set points(points: PolylineDataItem[]) {
    this._points = [...points];
  }

  get length(): number {
    return this._points.length;
  }

  get(index: number): PolylineDataItem {
    return this._points[index];
  }

  insert(index: number, element: PolylineDataItem): void {
    this._points.splice(index, 0, element);
  }

  clone(): PolylineData {
    const res: PolylineDataItem[] = [];
    for (let i = 0; i < this._points.length; ++i) {
      res.push(this._points[i].clone());
    }
    return new PolylineData(res);
  }

  get boundingRect(): Rect {
    let maxX, maxY, minX, minY;
    maxX = minX = this._points[0].point.x;
    maxY = minY = this._points[0].point.y;
    const length = this.length;
    for (let i = 0; i < length; ++i) {
      if (this._points[i].point.x > maxX) maxX = this._points[i].point.x;
      if (this._points[i].point.x < minX) minX = this._points[i].point.x;
      if (this._points[i].point.y > maxY) maxY = this._points[i].point.y;
      if (this._points[i].point.y < minY) minY = this._points[i].point.y;
    }
    return new Rect(new Vector2(minX, minY), new Vector2(maxX - minX, maxY - minY));
  }
}
