import { SpriteVertex } from './115_SpriteVertex';
import { PolylineItem } from './179_PolylineItem';

export class VerticesHolder {
  vertices: SpriteVertex[] = [];

  add(item: PolylineItem): void {
    this.vertices.push(item.vertex0);
    this.vertices.push(item.vertex1);
    this.vertices.push(item.vertex2);
    this.vertices.push(item.vertex3);
  }

  clear(): void {
    this.vertices = [];
  }
}
