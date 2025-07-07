import { ShaderProgram } from './103_ShaderProgram';
import { Color4 } from './10_Color4';
import { TextureWebGL } from './127_TextureWebGL';
import { GlContextHelper } from './150_GlContextHelper';
import { Texture } from './41_Texture';
import { InputLayout } from './49_InputLayout';
import { IndexBuffer } from './61_IndexBuffer';
import { BlendState } from './63_BlendState';
import { RasterizerState } from './65_RasterizerState';
import { VertexBuffer } from './75_VertexBuffer';
import { PrimitiveType } from './26_PrimitiveType';
import { VertexElementFormat } from './149_VertexElementFormat';

export class RenderContext {
  static MAX_TEXTURE_UNITS = 8;
  static MAX_STREAM_SOURCES = 2;

  private _context: WebGLRenderingContext;
  private _contextHelper: GlContextHelper;

  private _textures: Array<Texture | null> = new Array<Texture | null>(
    RenderContext.MAX_TEXTURE_UNITS
  );

  private _streams: Array<VertexBuffer | null> = new Array<VertexBuffer | null>(
    RenderContext.MAX_STREAM_SOURCES
  );
  private _streamStrides: number[] = new Array<number>(RenderContext.MAX_STREAM_SOURCES);

  private _inputLayout: InputLayout | null = null;
  private _inputLayoutValid: boolean = false;

  private _indexBuffer: IndexBuffer;
  private _indexBufferValid: boolean = false;

  private _shaderProgram: ShaderProgram | null = null;

  private _primitiveType: PrimitiveType;

  private _blend: BlendState | null = null;
  private _blendValid: boolean = false;

  private _rasterizer: RasterizerState | null = null;
  private _rasterizerValid: boolean = false;

  constructor(context: WebGLRenderingContext, contextHelper: GlContextHelper) {
    this._context = context;
    this._contextHelper = contextHelper;
  }

  begin(): void {}

  end(): void {}

  reset(): void {
    this._inputLayout = null;
    this._inputLayoutValid = false;

    this._blendValid = false;
    this._blend = null;

    this._rasterizerValid = false;
    this._rasterizer = null;

    this._shaderProgram = null;

    this._contextHelper.reset();
  }

  clear(color: Color4): void {
    this._context.clearColor(color.r, color.g, color.b, color.a);
    this._context.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
  }

  setInputLayout(layout: InputLayout): void {
    if (this._inputLayout !== layout) {
      this._inputLayout = layout;
      this._inputLayoutValid = false;
    }
  }

  setStreamSource(stream: number, buffer: VertexBuffer | null, stride: number): void {
    this._streams[stream] = buffer;
    this._streamStrides[stream] = stride;
  }

  setIndexBuffer(buffer: IndexBuffer): void {
    if (this._indexBuffer !== buffer) {
      this._indexBuffer = buffer;
      this._indexBufferValid = false;
    }
  }

  setShaderProgram(shader: ShaderProgram | null): void {
    this._shaderProgram = shader;
  }

  setPrimitiveType(primitiveType: PrimitiveType): void {
    this._primitiveType = primitiveType;
  }

  setTexture(unit: number, texture: Texture | null): void {
    this._textures[unit] = texture;
  }

  setBlend(blend: BlendState | null): void {
    if (this._blend !== blend) {
      this._blend = blend;
      this._blendValid = false;
    }
  }

  setRasterizer(rasterizer: RasterizerState | null): void {
    if (this._rasterizer !== rasterizer) {
      this._rasterizer = rasterizer;
      this._rasterizerValid = false;
    }
  }

  setViewPort(x: number, y: number, width: number, height: number): void {
    this._context.viewport(x, y, width, height);
  }

  setScissor(x: number, y: number, width: number, height: number): void {
    this._context.scissor(x, y, width, height);
  }

  enableScissor(): void {
    this._context.enable(WebGLRenderingContext.SCISSOR_TEST);
  }

  disableScissor(): void {
    this._context.disable(WebGLRenderingContext.SCISSOR_TEST);
  }

  setRenderTarget(renderTarget: Texture | null): void {
    if (renderTarget) {
      const rt = renderTarget as TextureWebGL;
      this._context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, rt.frameBuffer);
    } else {
      this._context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
    }
  }

  draw(startVertex: number, verticesCount: number): void {
    this._applyShader();

    this._applyBlend();
    this._applyRasterizer();
    this._applyInputLayout();
    this._applyTextures();

    this._context.drawArrays(this._primitiveType, startVertex, verticesCount);
  }

  drawIndexed(startIndex: number, indicesCount: number): void {
    this._applyShader();

    this._applyBlend();
    this._applyRasterizer();
    this._applyIndexBuffer();
    this._applyInputLayout();
    this._applyTextures();

    this._context.drawElements(
      this._primitiveType,
      indicesCount,
      WebGLRenderingContext.UNSIGNED_SHORT,
      startIndex
    );
  }

  private _applyBlend(): void {
    if (!this._blendValid) {
      if (this._blend) {
        if (this._blend.enabled) {
          this._context.enable(WebGLRenderingContext.BLEND);
          this._context.blendFunc(this._blend.src, this._blend.dst);
        } else {
          this._context.disable(WebGLRenderingContext.BLEND);
        }
      } else {
        this._context.disable(WebGLRenderingContext.BLEND);
      }
      this._blendValid = true;
    }
  }

  private _applyRasterizer(): void {
    if (this._rasterizer) {
      if (this._rasterizer.description.scissocTestEnable) {
        this._context.enable(WebGLRenderingContext.SCISSOR_TEST);
        this._context.scissor(
          Math.round(this._rasterizer.description.scissor.lt.x),
          Math.round(this._rasterizer.description.scissor.lt.y),
          Math.round(this._rasterizer.description.scissor.width),
          Math.round(this._rasterizer.description.scissor.height)
        );
      } else {
        this._context.disable(WebGLRenderingContext.SCISSOR_TEST);
      }
    } else {
      this._context.disable(WebGLRenderingContext.SCISSOR_TEST);
    }
    this._rasterizerValid = true;
  }

  private _applyShader(): void {
    if (this._shaderProgram) {
      this._contextHelper.useProgram(this._shaderProgram.program);
    }
  }

  private _applyTextures(): void {
    for (let i = 0; i < this._textures.length; ++i) {
      if (this._textures[i]) {
        const t = this._textures[i] as TextureWebGL;
        this._contextHelper.bindTexture(i, t.texture);
      }
    }
  }

  private _applyInputLayout(): void {
    if (!this._inputLayoutValid) {
      const layout = this._inputLayout!;

      for (let i = 0; i < layout.elements.length; ++i) {
        const e = layout.elements[i];

        const vb = this._streams[e.stream];
        if (!vb) {
          continue;
        }

        this._contextHelper.bindArrayBuffer(vb.buffer);

        const stride = this._streamStrides[e.stream];

        if (e.format === VertexElementFormat.Matrix3) {
          this._context.enableVertexAttribArray(e.location + 0);
          this._context.enableVertexAttribArray(e.location + 1);
          this._context.enableVertexAttribArray(e.location + 2);

          this._context.vertexAttribPointer(
            e.location + 0,
            3,
            WebGLRenderingContext.FLOAT,
            false,
            stride,
            e.offset + 0
          );
          this._context.vertexAttribPointer(
            e.location + 1,
            3,
            WebGLRenderingContext.FLOAT,
            false,
            stride,
            e.offset + 12
          );
          this._context.vertexAttribPointer(
            e.location + 2,
            3,
            WebGLRenderingContext.FLOAT,
            false,
            stride,
            e.offset + 24
          );
        } else {
          this._context.enableVertexAttribArray(e.location);
          const normalized = e.format === VertexElementFormat.Int32;
          this._context.vertexAttribPointer(
            e.location,
            this._GetGlSize(e.format),
            this._GetGlType(e.format),
            normalized,
            stride,
            e.offset
          );
        }
      }

      this._inputLayoutValid = true;
    }
  }

  private _applyIndexBuffer(): void {
    if (!this._indexBufferValid) {
      this._context.bindBuffer(
        WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
        this._indexBuffer.buffer
      );
      this._indexBufferValid = true;
    }
  }

  private _GetGlSize(format: VertexElementFormat): number {
    switch (format) {
      case VertexElementFormat.Vector4f:
        return 4;
      case VertexElementFormat.Vector2f:
        return 2;
      case VertexElementFormat.Int32:
        return 4;
      default:
        throw new Error('Unknown VertexElementFormat');
    }
  }

  private _GetGlType(format: VertexElementFormat): number {
    switch (format) {
      case VertexElementFormat.Vector4f:
        return WebGLRenderingContext.FLOAT;
      case VertexElementFormat.Vector2f:
        return WebGLRenderingContext.FLOAT;
      case VertexElementFormat.Int32:
        return WebGLRenderingContext.UNSIGNED_BYTE;
      default:
        throw new Error('Unknown VertexElementFormat');
    }
  }
}
