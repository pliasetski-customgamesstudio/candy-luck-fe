import { VertexData } from './188_VertexData';
import { SpriteVertex } from './115_SpriteVertex';
import { Color4 } from './10_Color4';

export abstract class SpriteVertexData extends VertexData {
  constructor(vertexSize: number, verticesCount: number) {
    super(vertexSize, verticesCount);
  }

  abstract setVertex(i: number, x: number, y: number, u: number, v: number, color: Color4): void;

  abstract setVertexFromList(i: number, data: Float32Array, color: Color4): void;

  setVertices(offset: number, vertices: SpriteVertex[]): void {
    const cnt = vertices.length;
    for (let i = 0; i < cnt; ++i) {
      const v = vertices[i];
      this.setVertex(offset + i, v.pos.x, v.pos.y, v.uv.x, v.uv.y, v.color);
    }
  }
}
