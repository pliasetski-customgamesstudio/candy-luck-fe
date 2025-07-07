import { Color4 } from './10_Color4';
import { Vector2 } from './15_Vector2';

export class PolylineDataItem {
  point: Vector2;
  color: Color4;

  constructor(point: Vector2, color: Color4) {
    this.point = point;
    this.color = color;
  }

  clone(): PolylineDataItem {
    return new PolylineDataItem(this.point.clone(), this.color.clone());
  }

  destinationTo(other: PolylineDataItem): number {
    return this.point.distance(other.point);
  }

  angleTo(other: PolylineDataItem): number {
    if (this.point.x === other.point.x) {
      if (this.point.y > other.point.y) {
        return -Math.PI / 2;
      } else {
        return Math.PI / 2;
      }
    }
    return Math.atan2(other.point.y - this.point.y, other.point.x - this.point.x);
  }
}
