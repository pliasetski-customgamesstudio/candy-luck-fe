import { ShaderProgram } from './103_ShaderProgram';
import { TextureWebGL } from './127_TextureWebGL';
import { GlContextHelper } from './150_GlContextHelper';
import { RenderDevice } from './244_RenderDevice';
import { GraphicsResourceUsage } from './29_GraphicsResourceUsage';
import { Texture } from './41_Texture';
import { IndexBuffer } from './61_IndexBuffer';
import { BlendState } from './63_BlendState';
import { Blend } from './68_Blend';
import { VertexBuffer } from './75_VertexBuffer';

export class RenderDeviceWebGL extends RenderDevice {
  private readonly _context: WebGLRenderingContext;
  private readonly _contextHelper: GlContextHelper;

  constructor(context: WebGLRenderingContext, contextHelper: GlContextHelper) {
    super();
    this._context = context;
    this._contextHelper = contextHelper;
  }

  createVertexBuffer(size: number, usage: GraphicsResourceUsage): VertexBuffer {
    const buffer = this._context.createBuffer()!;

    this._contextHelper.bindArrayBuffer(buffer);
    this._context.bufferData(
      WebGLRenderingContext.ARRAY_BUFFER,
      size * Int8Array.BYTES_PER_ELEMENT,
      usage
    );

    return new VertexBuffer(this._context, this._contextHelper, buffer);
  }

  createIndexBuffer(count: number, usage: GraphicsResourceUsage): IndexBuffer {
    const buffer = this._context.createBuffer()!;

    this._contextHelper.bindElementArrayBuffer(buffer);
    this._context.bufferData(
      WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
      count * Int16Array.BYTES_PER_ELEMENT,
      usage
    );

    return new IndexBuffer(this._context, this._contextHelper, buffer);
  }

  createTextureFromVideo(video: HTMLVideoElement): Texture {
    const texture = this._context.createTexture()!;

    this._contextHelper.bindTexture(0, texture);
    this._setupTexture();

    return new TextureWebGL(
      this._context,
      this._contextHelper,
      texture,
      video.videoWidth,
      video.videoHeight
    );
  }

  updateTextureFromVideo(texture: Texture, video: HTMLVideoElement): void {
    const t = texture as TextureWebGL;
    this._contextHelper.bindTexture(0, t.texture);

    this._context.texImage2D(
      WebGLRenderingContext.TEXTURE_2D,
      0,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.UNSIGNED_BYTE,
      video
    );
  }

  updateTextureFromCanvas(texture: Texture, canvas: HTMLCanvasElement): void {
    const t = texture as TextureWebGL;
    this._contextHelper.bindTexture(0, t.texture);

    this._context.texImage2D(
      WebGLRenderingContext.TEXTURE_2D,
      0,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.UNSIGNED_BYTE,
      canvas
    );
  }

  createTextureFromCanvas(canvas: HTMLCanvasElement): Texture {
    const texture = this._context.createTexture()!;

    this._contextHelper.bindTexture(0, texture);
    this._context.texImage2D(
      WebGLRenderingContext.TEXTURE_2D,
      0,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.UNSIGNED_BYTE,
      canvas
    );

    this._setupTexture();

    return new TextureWebGL(
      this._context,
      this._contextHelper,
      texture,
      canvas.width,
      canvas.height
    );
  }

  createTextureFromImage(image: HTMLImageElement): Texture | null {
    const texture = this._context.createTexture();

    this._contextHelper.bindTexture(0, texture);

    this._context.pixelStorei(WebGLRenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    try {
      this._context.texImage2D(
        WebGLRenderingContext.TEXTURE_2D,
        0,
        WebGLRenderingContext.RGBA,
        WebGLRenderingContext.RGBA,
        WebGLRenderingContext.UNSIGNED_BYTE,
        image
      );
    } catch (error) {
      console.warn(`Catchable error in createTextureFromImage:\n${error}`);

      this._contextHelper.bindTexture(0, null);
      this._context.deleteTexture(texture);
      return null;
    }

    this._setupTexture();

    return new TextureWebGL(this._context, this._contextHelper, texture, image.width, image.height);
  }

  createShaderProgram(vsSource: string, fsSource: string, defines: string[]): ShaderProgram {
    let def = '';
    for (let i = 0; i < defines.length; ++i) {
      const d = defines[i];
      def += d;
      def += '\n';
    }

    // vertex shader compilation
    const vs = this._context.createShader(WebGLRenderingContext.VERTEX_SHADER)!;
    this._context.shaderSource(vs, defines.length > 0 ? def + vsSource : vsSource);
    this._context.compileShader(vs);

    // fragment shader compilation
    const fs = this._context.createShader(WebGLRenderingContext.FRAGMENT_SHADER)!;
    this._context.shaderSource(fs, defines.length > 0 ? def + fsSource : fsSource);
    this._context.compileShader(fs);

    const program = this._context.createProgram()!;
    this._context.attachShader(program, vs);
    this._context.attachShader(program, fs);

    // it will be flagged for deletion, but it will not be deleted until it is no longer attached to any program object
    this._context.deleteShader(fs);
    this._context.deleteShader(vs);

    return new ShaderProgram(this._context, this._contextHelper, program);
  }

  createBlend(enabled: boolean, src: Blend, dst: Blend): BlendState {
    return new BlendState(enabled, src, dst);
  }

  private _setupTexture(): void {
    this._context.texParameteri(
      WebGLRenderingContext.TEXTURE_2D,
      WebGLRenderingContext.TEXTURE_MAG_FILTER,
      WebGLRenderingContext.LINEAR
    );
    this._context.texParameteri(
      WebGLRenderingContext.TEXTURE_2D,
      WebGLRenderingContext.TEXTURE_MIN_FILTER,
      WebGLRenderingContext.LINEAR
    );

    this._context.texParameteri(
      WebGLRenderingContext.TEXTURE_2D,
      WebGLRenderingContext.TEXTURE_WRAP_S,
      WebGLRenderingContext.CLAMP_TO_EDGE
    );
    this._context.texParameteri(
      WebGLRenderingContext.TEXTURE_2D,
      WebGLRenderingContext.TEXTURE_WRAP_T,
      WebGLRenderingContext.CLAMP_TO_EDGE
    );
  }

  createRenderTarget(width: number, height: number): Texture {
    const frameBuffer = this._context.createFramebuffer()!;
    const texture = this._context.createTexture();

    this._contextHelper.bindTexture(0, texture);
    this._setupTexture();

    this._context.texImage2D(
      WebGLRenderingContext.TEXTURE_2D,
      0,
      WebGLRenderingContext.RGBA,
      width,
      height,
      0,
      WebGLRenderingContext.RGBA,
      WebGLRenderingContext.UNSIGNED_BYTE,
      null
    );

    this._context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, frameBuffer);
    this._context.framebufferTexture2D(
      WebGLRenderingContext.FRAMEBUFFER,
      WebGLRenderingContext.COLOR_ATTACHMENT0,
      WebGLRenderingContext.TEXTURE_2D,
      texture,
      0
    );
    this._context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);

    return TextureWebGL.FromRenderTarget(
      this._context,
      this._contextHelper,
      frameBuffer,
      texture,
      width,
      height
    );
  }
}
