import { GlContextHelper } from './150_GlContextHelper';
import { Texture } from './41_Texture';

export class TextureWebGL extends Texture {
  static FromRenderTarget(
    _context: WebGLRenderingContext,
    _helper: GlContextHelper,
    _frameBuffer: WebGLFramebuffer,
    _texture: WebGLTexture | null,
    width: number,
    height: number
  ): TextureWebGL {
    return new TextureWebGL(_context, _helper, _texture, width, height).withFramebuffer(
      _frameBuffer
    );
  }

  private readonly _context: WebGLRenderingContext;
  private readonly _helper: GlContextHelper;
  private _texture: WebGLTexture | null = null;
  private _frameBuffer: WebGLFramebuffer | null = null;

  constructor(
    _context: WebGLRenderingContext,
    _helper: GlContextHelper,
    _texture: WebGLTexture | null,
    width: number,
    height: number
  ) {
    super(width, height);
    this._context = _context;
    this._helper = _helper;
    this._texture = _texture;
  }

  get texture(): WebGLTexture | null {
    return this._texture;
  }

  get frameBuffer(): WebGLFramebuffer | null {
    return this._frameBuffer;
  }

  withFramebuffer(frameBuffer: WebGLFramebuffer): TextureWebGL {
    this._frameBuffer = frameBuffer;
    return this;
  }

  dispose(): void {
    if (this._texture) {
      this._helper.unbindTexture(this._texture);
    }
    this._context.deleteTexture(this._texture);

    this._texture = null;

    if (this._frameBuffer) {
      this._context.deleteFramebuffer(this._frameBuffer);
      this._frameBuffer = null;
    }
  }
}
