import { VertexElementFormat } from './149_VertexElementFormat';

export class InputLayoutElement {
  public readonly stream: number;
  public readonly location: number;
  public readonly format: VertexElementFormat;
  public readonly offset: number;

  constructor(stream: number, location: number, format: VertexElementFormat, offset: number) {
    this.stream = stream;
    this.location = location;
    this.format = format;
    this.offset = offset;
  }
}
