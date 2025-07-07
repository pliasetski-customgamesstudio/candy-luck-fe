import { SpriteVertexData } from './152_SpriteVertexData';
import { InputLayout } from './49_InputLayout';
import { Color4 } from './10_Color4';
import { InputLayoutElement } from './46_InputLayoutElement';
import { VertexElementUsage } from './69_VertexElementUsage';
import { VertexElementFormat } from './149_VertexElementFormat';

export class SpriteVertexDataPacked extends SpriteVertexData {
  private _inputLayout: InputLayout;
  private _cachedColor: Color4;
  private _color: number;

  constructor(verticesCount: number) {
    super(SpriteVertexDataPacked.VERTEX_SIZE, verticesCount);
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
        VertexElementFormat.Int32,
        Float32Array.BYTES_PER_ELEMENT * 4
      ),
    ]);
  }

  public get inputLayout(): InputLayout {
    return this._inputLayout;
  }

  public setVertex(i: number, x: number, y: number, u: number, v: number, color: Color4): void {
    if (this._cachedColor !== color) {
      this._color = color.asInt32;
      this._cachedColor = color;
    }

    const offset = i * SpriteVertexDataPacked.VERTEX_SIZE_IN_FLOATS;

    this.floatData[offset] = x;
    this.floatData[offset + 1] = y;

    this.floatData[offset + 2] = u;
    this.floatData[offset + 3] = v;

    this.int32Data[offset + 4] = this._color;
  }

  public setVertexFromList(i: number, data: Float32Array, color: Color4): void {
    if (this._cachedColor !== color) {
      this._color = color.asInt32;
      this._cachedColor = color;
    }

    const offset = i * SpriteVertexDataPacked.VERTEX_SIZE_IN_FLOATS;

    this.floatData[offset] = data[0];
    this.floatData[offset + 1] = data[1];

    this.floatData[offset + 2] = data[2];
    this.floatData[offset + 3] = data[3];

    this.int32Data[offset + 4] = this._color;
  }

  private static readonly VERTEX_SIZE: number =
    Float32Array.BYTES_PER_ELEMENT * 2 +
    Float32Array.BYTES_PER_ELEMENT * 2 +
    Int32Array.BYTES_PER_ELEMENT;

  private static readonly VERTEX_SIZE_IN_FLOATS: number = SpriteVertexDataPacked.VERTEX_SIZE >> 2;
}
