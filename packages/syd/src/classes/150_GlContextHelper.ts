import { RenderContext } from './278_RenderContext';

export class GlContextHelper {
  private readonly context: WebGLRenderingContext;

  private arrayBuffer: WebGLBuffer | null = null;
  private elementArrayBuffer: WebGLBuffer | null = null;
  private program: WebGLProgram | null = null;
  private activeUnit: number;
  private textures: Array<WebGLTexture | null>;

  constructor(context: WebGLRenderingContext) {
    this.context = context;
    this.arrayBuffer = null;
    this.elementArrayBuffer = null;
    this.program = null;
    this.activeUnit = -1;
    this.textures = new Array<WebGLTexture | null>(RenderContext.MAX_TEXTURE_UNITS);
  }

  public reset(): void {
    this.activeUnit = -1;
  }

  private selectTextureUnit(unit: number): void {
    if (this.activeUnit !== unit) {
      this.context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
      this.activeUnit = unit;
    }
  }

  public bindTexture(unit: number, texture: WebGLTexture | null): void {
    if (this.textures[unit] !== texture) {
      this.selectTextureUnit(unit);
      this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture);
      this.textures[unit] = texture;
    }
  }

  public unbindTexture(texture: WebGLTexture): void {
    for (let i = 0; i < this.textures.length; ++i) {
      if (this.textures[i] === texture) {
        this.selectTextureUnit(i);
        this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
        this.textures[i] = null;
      }
    }
  }

  public bindArrayBuffer(buffer: WebGLBuffer): void {
    if (this.arrayBuffer !== buffer) {
      this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
      this.arrayBuffer = buffer;
    }
  }

  public unbindArrayBuffer(buffer: WebGLBuffer): void {
    if (this.arrayBuffer === buffer) {
      this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
      this.arrayBuffer = null;
    }
  }

  public bindElementArrayBuffer(buffer: WebGLBuffer): void {
    if (this.elementArrayBuffer !== buffer) {
      this.context.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, buffer);
      this.elementArrayBuffer = buffer;
    }
  }

  public unbindElementArrayBuffer(buffer: WebGLBuffer): void {
    if (this.elementArrayBuffer === buffer) {
      this.context.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, null);
      this.elementArrayBuffer = null;
    }
  }

  public useProgram(program: WebGLProgram): void {
    if (this.program !== program) {
      this.context.useProgram(program);
      this.program = program;
    }
  }

  public unuseProgram(program: WebGLProgram): void {
    if (this.program === program) {
      this.context.useProgram(null);
      this.program = null;
    }
  }
}
