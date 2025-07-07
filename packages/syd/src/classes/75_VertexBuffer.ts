import { GlContextHelper } from './150_GlContextHelper';

export class VertexBuffer {
  private readonly _context: WebGLRenderingContext;
  private readonly _buffer: WebGLBuffer;
  private readonly _contextHelper: GlContextHelper;

  constructor(context: WebGLRenderingContext, contextHelper: GlContextHelper, buffer: WebGLBuffer) {
    this._context = context;
    this._contextHelper = contextHelper;
    this._buffer = buffer;
  }

  public get buffer(): WebGLBuffer {
    return this._buffer;
  }

  public fill(offset: number, data: Int8Array): void {
    this._contextHelper.bindArrayBuffer(this._buffer);
    this._context.bufferSubData(WebGLRenderingContext.ARRAY_BUFFER, offset, data);
  }

  public destroy(): void {
    this._contextHelper.unbindArrayBuffer(this._buffer);
    this._context.deleteBuffer(this._buffer);
  }
}
