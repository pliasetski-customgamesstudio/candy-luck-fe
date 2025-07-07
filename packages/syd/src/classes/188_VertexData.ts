import { InputLayout } from './49_InputLayout';
import { VertexBuffer } from './75_VertexBuffer';

export abstract class VertexData {
  public vertexSize: number;
  protected _vertices: Int8Array;
  protected _floatData: Float32Array;
  protected _int32Data: Int32Array;

  public get floatData(): Float32Array {
    return this._floatData;
  }

  public get int32Data(): Int32Array {
    return this._int32Data;
  }

  public abstract get inputLayout(): InputLayout;

  constructor(vertexSize: number, verticesCount: number) {
    const size = verticesCount * vertexSize;

    this.vertexSize = vertexSize;
    this._vertices = new Int8Array(size);
    this._floatData = new Float32Array(this._vertices.buffer);
    this._int32Data = new Int32Array(this._vertices.buffer);
  }

  public write(buffer: VertexBuffer, verticesCount: number): void {
    const vertexDataSize = verticesCount * this.vertexSize;
    const view = new Int8Array(this._vertices.buffer, 0, vertexDataSize);
    buffer.fill(0, view);
  }
}
