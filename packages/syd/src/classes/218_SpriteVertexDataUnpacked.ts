import { SpriteVertexData } from './152_SpriteVertexData';
import { InputLayout } from './49_InputLayout';
import { InputLayoutElement } from './46_InputLayoutElement';
import { VertexElementFormat } from './149_VertexElementFormat';
import { VertexElementUsage } from './69_VertexElementUsage';
import { Color4 } from './10_Color4';

export class SpriteVertexDataUnpacked extends SpriteVertexData {
  private _inputLayout: InputLayout;

  get inputLayout(): InputLayout {
    return this._inputLayout;
  }

  constructor(verticesCount: number) {
    super(SpriteVertexDataUnpacked.VERTEX_SIZE, verticesCount);
    this._inputLayout = new InputLayout([
      new InputLayoutElement(0, VertexElementUsage.Position, VertexElementFormat.Vector2f, 0),
      new InputLayoutElement(
        0,
        VertexElementUsage.TexCoord,
        VertexElementFormat.Vector2f,
        Float32Array.BYTES_PER_ELEMENT * 2
      ),
      new InputLayoutElement(
        0,
        VertexElementUsage.Color,
        VertexElementFormat.Vector4f,
        Float32Array.BYTES_PER_ELEMENT * 4
      ),
    ]);
  }

  setVertex(i: number, x: number, y: number, u: number, v: number, color: Color4): void {
    const offset = i * SpriteVertexDataUnpacked.VERTEX_SIZE_IN_FLOATS;

    this.floatData[offset] = x;
    this.floatData[offset + 1] = y;

    this.floatData[offset + 2] = u;
    this.floatData[offset + 3] = v;

    this.floatData[offset + 4] = color.r;
    this.floatData[offset + 5] = color.g;
    this.floatData[offset + 6] = color.b;
    this.floatData[offset + 7] = color.a;
  }

  setVertexFromList(i: number, data: Float32Array, color: Color4): void {
    const offset = i * SpriteVertexDataUnpacked.VERTEX_SIZE_IN_FLOATS;

    this.floatData[offset] = data[0];
    this.floatData[offset + 1] = data[1];

    this.floatData[offset + 2] = data[2];
    this.floatData[offset + 3] = data[3];
    this.floatData[offset + 4] = color.r;
    this.floatData[offset + 5] = color.g;
    this.floatData[offset + 6] = color.b;
    this.floatData[offset + 7] = color.a;
  }

  private static readonly VERTEX_SIZE =
    Float32Array.BYTES_PER_ELEMENT * 2 +
    Float32Array.BYTES_PER_ELEMENT * 2 +
    Float32Array.BYTES_PER_ELEMENT * 4;

  private static readonly VERTEX_SIZE_IN_FLOATS = SpriteVertexDataUnpacked.VERTEX_SIZE >> 2;
}
