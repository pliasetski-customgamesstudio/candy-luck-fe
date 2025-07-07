import { Vector2, PolylineData, Color4, PolylineDataItem, segmentsIntersection } from '@cgs/syd';

export class IntersectionCache {
  //value is flag which will be true where intersection with vertical line
  private _map: Map<Vector2, boolean> = new Map<Vector2, boolean>();

  exist(intersection: Vector2): boolean {
    return this._map.has(intersection);
  }

  isVertical(intersection: Vector2): boolean {
    return this._map.get(intersection) as boolean;
  }

  add(intersection: Vector2, isVertical: boolean): void {
    this._map.set(intersection, isVertical);
  }
}

export class PolylineExcluder {
  private _first: PolylineData;
  private _second: PolylineData;
  private _intersectCount: number;
  private _lineColor: Color4;
  private _intersectionCache: IntersectionCache = new IntersectionCache();

  constructor(first: PolylineData, second: PolylineData) {
    this._first = first.clone();
    this._second = second;
    this._intersectCount = 0;
    this._lineColor = this._first.points[0].color.clone();
  }

  private _checkHeadOverlap(): void {
    if (this._second.boundingRect.test(this._first.points[0].point)) {
      this._first.points[0].color = Color4.Transparent;
      this._intersectCount = 1;
    }
  }

  private _checkTailOverlap(): void {
    if (this._second.boundingRect.test(this._first.points[this._first.points.length - 1].point)) {
      this._first.points[this._first.points.length - 2].color = Color4.Transparent;
    }
  }

  private _getIntersections(start: PolylineDataItem, end: PolylineDataItem): Vector2[] {
    const intersections: Vector2[] = [];
    let itemIdx = 0;
    while (itemIdx < this._second.length - 1) {
      const intersec = segmentsIntersection(
        start.point,
        end.point,
        this._second.points[itemIdx].point,
        this._second.points[itemIdx + 1].point
      );
      if (start.color !== Color4.Transparent && intersec) {
        if (!this._intersectionCache.exist(intersec)) {
          intersections.push(intersec);
          this._intersectionCache.add(
            intersec,
            this._second.points[itemIdx].point.x === this._second.points[itemIdx + 1].point.x
          );
        }
      }
      ++itemIdx;
    }
    return intersections;
  }

  exclude(): PolylineData {
    this._checkHeadOverlap();
    this._checkTailOverlap();

    let i = 0;
    while (i < this._first.points.length - 1) {
      const intersections = this._getIntersections(
        this._first.points[i],
        this._first.points[i + 1]
      );
      intersections.sort((lhs, rhs) => (lhs.x !== rhs.x ? lhs.x - rhs.x : lhs.y - rhs.y));
      intersections.forEach((intersect) => {
        ++this._intersectCount;
        if (this._intersectCount % 2 === 0) {
          this._first.points[i].color = Color4.Transparent;
          if (this._intersectionCache.exist(intersect))
            this.addTransparent(++i, intersect, this._first.points[i].point);
          this._first.points.splice(++i, 0, new PolylineDataItem(intersect, this._lineColor));
        } else {
          this._addTransparent(++i, intersect);
          if (this._intersectionCache.exist(intersect))
            this.addTransparent(++i, intersect, this._first.points[i - 2].point);
        }
      });
      ++i;
    }
    return this._first;
  }

  private addTransparent(elementPos: number, intersect: Vector2, point: Vector2): void {
    if (this._intersectionCache.isVertical(intersect)) {
      this._addTransparent(elementPos, new Vector2(2 * intersect.x - point.x, point.y));
    } else {
      this._addTransparent(elementPos, new Vector2(point.x, 2 * intersect.y - point.y));
    }
  }

  private _addTransparent(elementPos: number, pos: Vector2): void {
    this._first.points.splice(elementPos, 0, new PolylineDataItem(pos, Color4.Transparent));
  }
}

export function exclude(first: PolylineData, second: PolylineData): PolylineData {
  const excluder = new PolylineExcluder(first, second);
  return excluder.exclude();
}
