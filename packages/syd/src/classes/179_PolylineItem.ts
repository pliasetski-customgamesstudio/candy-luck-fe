import { linesIntersection, Vector2 } from './15_Vector2';
import { Matrix3 } from './57_Matrix3';
import { PolylineDataItem } from './94_PolylineDataItem';
import { SpriteVertex } from './115_SpriteVertex';

export class PolylineItem {
  vertex0: SpriteVertex;
  vertex1: SpriteVertex;
  vertex2: SpriteVertex;
  vertex3: SpriteVertex;

  constructor(
    vertex0: SpriteVertex,
    vertex1: SpriteVertex,
    vertex2: SpriteVertex,
    vertex3: SpriteVertex
  ) {
    this.vertex0 = vertex0;
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.vertex3 = vertex3;
  }

  static empty(): PolylineItem {
    return new PolylineItem(
      SpriteVertex.empty(),
      SpriteVertex.empty(),
      SpriteVertex.empty(),
      SpriteVertex.empty()
    );
  }

  update(fromItem: PolylineDataItem, toItem: PolylineDataItem, width: number): void {
    const angle: number = fromItem.angleTo(toItem);
    const rotate: Matrix3 = Matrix3.fromRotation(angle);
    const halfWidth: number = width / 2.0;
    this.vertex0.color =
      this.vertex1.color =
      this.vertex2.color =
      this.vertex3.color =
        fromItem.color;

    this.vertex0.uv.x = 0.0;
    this.vertex0.uv.y = 1.0;

    this.vertex1.uv.x = 1.0;
    this.vertex1.uv.y = 1.0;

    this.vertex2.uv.x = 0.0;
    this.vertex2.uv.y = 0.0;

    this.vertex3.uv.x = 1.0;
    this.vertex3.uv.y = 0.0;

    const vWidth: Vector2 = new Vector2(0.0, halfWidth);
    rotate.transformVectorInplace(vWidth);
    this.vertex2.pos.x = fromItem.point.x - vWidth.x;
    this.vertex2.pos.y = fromItem.point.y - vWidth.y;

    this.vertex0.pos.x = fromItem.point.x + vWidth.x;
    this.vertex0.pos.y = fromItem.point.y + vWidth.y;

    this.vertex1.pos.x = toItem.point.x + vWidth.x;
    this.vertex1.pos.y = toItem.point.y + vWidth.y;

    this.vertex3.pos.x = toItem.point.x - vWidth.x;
    this.vertex3.pos.y = toItem.point.y - vWidth.y;
  }

  static correct(first: PolylineItem, second: PolylineItem): void {
    let intersect = linesIntersection(
      first.vertex0.pos,
      first.vertex1.pos,
      second.vertex0.pos,
      second.vertex1.pos
    );
    if (intersect !== null) {
      first.vertex1.pos = second.vertex0.pos = intersect;
      intersect = linesIntersection(
        first.vertex2.pos,
        first.vertex3.pos,
        second.vertex2.pos,
        second.vertex3.pos
      );
      if (intersect !== null) {
        first.vertex3.pos = second.vertex2.pos = intersect;
      }
    }
  }
}
