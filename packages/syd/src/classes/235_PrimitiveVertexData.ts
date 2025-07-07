import { Color4 } from './10_Color4';
import { PrimitiveVertex } from './128_PrimitiveVertex';
import { Vector2 } from './15_Vector2';
import { VertexData } from './188_VertexData';
import { InputLayoutElement } from './46_InputLayoutElement';
import { InputLayout } from './49_InputLayout';
import { VertexElementFormat } from './149_VertexElementFormat';
import { VertexElementUsage } from './69_VertexElementUsage';

export class PrimitiveVertexData extends VertexData {
  private _inputLayout: InputLayout;

  get inputLayout(): InputLayout {
    return this._inputLayout;
  }

  constructor(verticesCount: number) {
    super(PrimitiveVertexData.VERTEX_SIZE, verticesCount);
    this._inputLayout = new InputLayout([
      new InputLayoutElement(0, VertexElementUsage.Position, VertexElementFormat.Vector2f, 0),
      new InputLayoutElement(
        0,
        VertexElementUsage.Color,
        VertexElementFormat.Int32,
        Float32Array.BYTES_PER_ELEMENT * 2
      ),
    ]);
  }

  setVertices(vertices: PrimitiveVertex[]): void {
    const cnt = vertices.length;
    for (let i = 0; i < cnt; ++i) {
      const v = vertices[i];
      this.setVertex(i, v.pos, v.color);
    }
  }

  setVertex(i: number, v: Vector2, color: Color4): void {
    const offset = i * PrimitiveVertexData.VERTEX_SIZE_IN_FLOATS;

    this.floatData[offset] = v.x;
    this.floatData[offset + 1] = v.y;

    this.int32Data[offset + 2] = color.asInt32;
  }

  static readonly VERTEX_SIZE = Float32Array.BYTES_PER_ELEMENT * 2 + Int32Array.BYTES_PER_ELEMENT;
  static readonly VERTEX_SIZE_IN_FLOATS = PrimitiveVertexData.VERTEX_SIZE >> 2;
}
