import { GlContextHelper } from './150_GlContextHelper';
import { WebGL } from './WebGL';

export class IndexBuffer {
  private readonly m_context: WebGLRenderingContext;
  private readonly m_buffer: WebGLBuffer;
  private readonly m_contextHelper: GlContextHelper;

  constructor(context: WebGLRenderingContext, contextHelper: GlContextHelper, buffer: WebGLBuffer) {
    this.m_context = context;
    this.m_buffer = buffer;
    this.m_contextHelper = contextHelper;
  }

  get buffer(): WebGLBuffer {
    return this.m_buffer;
  }

  fill(offset: number, data: Int16Array): void {
    this.m_contextHelper.bindElementArrayBuffer(this.m_buffer);
    this.m_context.bufferSubData(WebGL.ELEMENT_ARRAY_BUFFER, offset, data);
  }

  destroy(): void {
    this.m_contextHelper.unbindElementArrayBuffer(this.m_buffer);
    this.m_context.deleteBuffer(this.m_buffer);
  }
}
