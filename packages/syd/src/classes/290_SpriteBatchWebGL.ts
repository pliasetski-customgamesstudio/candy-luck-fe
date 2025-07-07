import { Rect } from './112_Rect';
import { PrimitiveVertex } from './128_PrimitiveVertex';
import { ImageAdjustParams } from './129_ImageAdjustParams';
import { SpriteVertexData } from './152_SpriteVertexData';
import { Vector2 } from './15_Vector2';
import { VertexData } from './188_VertexData';
import { MaskParams } from './210_MaskParams';
import { Mask } from './211_Mask';
import { SpriteVertexDataPacked } from './215_SpriteVertexDataPacked';
import { PrimitiveVertexData } from './235_PrimitiveVertexData';
import { RenderDevice } from './244_RenderDevice';
import { SpriteBatch } from './248_SpriteBatch';
import { StateManager } from './261_StateManager';
import { getTrianglesCount, PrimitiveType } from './26_PrimitiveType';
import { RenderContext } from './278_RenderContext';
import { Texture } from './41_Texture';
import { ImageAdjust } from './55_ImageAdjust';
import { Matrix3 } from './57_Matrix3';
import { IndexBuffer } from './61_IndexBuffer';
import { BlendState } from './63_BlendState';
import { Matrix4 } from './64_Matrix4';
import { RasterizerState } from './65_RasterizerState';
import { VertexBuffer } from './75_VertexBuffer';
import { View } from './86_View';
import { RenderSupport } from './241_RenderSupport';
import { Effect } from './89_Effect';
import { SpriteVertex } from './115_SpriteVertex';
import { Color4 } from './10_Color4';
import { Shader } from './252_Shader';
import { Log } from './81_Log';
import { GraphicsResourceUsage } from './29_GraphicsResourceUsage';

export class SpriteBatchWebGL extends SpriteBatch {
  private readonly _view: View;
  private readonly _renderContext: RenderContext;

  get context(): RenderContext {
    return this._renderContext;
  }

  private readonly _renderDevice: RenderDevice;
  private _stateManager: StateManager;
  private readonly _maxQuadsCount: number;
  private _vertexBuffer: VertexBuffer;
  private _indexBuffer: IndexBuffer;
  private _vertices: SpriteVertexData;
  private _primitives: PrimitiveVertexData;
  private _quadsCount: number = 0;
  private _texture: Texture;
  private _blend: BlendState | null = null;
  private _rasterizer: RasterizerState | null = null;
  private _effect: number = 0;
  private _worldTransform: Matrix3 | null = null;
  private _hasColor: boolean;
  private _imageAdjust: ImageAdjust | null = null;
  private _imageAdjustParams: ImageAdjustParams = new ImageAdjustParams();
  private _mask1: Mask | null = null;
  private _mask2: Mask | null = null;
  private _maskParams1: MaskParams = new MaskParams();
  private _maskParams2: MaskParams = new MaskParams();
  private readonly vertex: Float32Array = new Float32Array(4);
  private _renderTarget: Texture | null = null;
  private _coordinateSystem: Rect;
  private _projection: Matrix4;

  constructor(
    view: View,
    renderContext: RenderContext,
    renderDevice: RenderDevice,
    renderSupport: RenderSupport,
    { maxQuadsCount = 1024 }: { maxQuadsCount?: number } = {}
  ) {
    super(renderSupport);
    this._view = view;
    this._renderContext = renderContext;
    this._renderDevice = renderDevice;
    this._maxQuadsCount = maxQuadsCount;
    this._stateManager = new StateManager();
    this._imageAdjustParams.update(ImageAdjust.Default);
    this._initIndexBuffer();
    this._initVertexBuffer();
  }

  getCoordinateSystem(): Rect {
    return this._coordinateSystem;
  }

  setCoordinateSystem(rect: Rect): void {
    this._flush();
    this._coordinateSystem = rect;
    if (this._renderTarget) {
      this._projection = Matrix4.orthoProjection(
        new Vector2(rect.lt.x, rect.rb.y),
        new Vector2(rect.rb.x, rect.lt.y),
        0.0,
        100.0
      );
      this._renderContext.setViewPort(0, 0, this._renderTarget.width, this._renderTarget.height);
    } else {
      this._projection = Matrix4.orthoProjection(rect.lt, rect.rb, 0.0, 100.0);
      this._renderContext.setViewPort(0, 0, this._view.width, this._view.height);
    }
  }

  setRenderTarget(renderTarget: Texture | null): void {
    this.flush();
    this._renderTarget = renderTarget;
    this._renderContext.setRenderTarget(renderTarget);
  }

  getRenderTarget(): Texture | null {
    return this._renderTarget;
  }

  begin(): void {
    this.batchesCount = 0;
    this.trianglesCount = 0;
    this._quadsCount = 0;
    this._renderContext.begin();
    this._stateManager.addState();
  }

  end(): void {
    this._flush();
    this._renderContext.end();
    this._stateManager.removeState();
  }

  flush(): void {
    this._flush();
  }

  pushState(state: any): void {
    this._stateManager.pushState(state);
  }

  setState(state: any): void {
    this._stateManager.setState(state);
  }

  popState(state: any): void {
    this._stateManager.popState(state);
  }

  draw(
    texture: Texture,
    srcRect: Rect,
    pos: Vector2,
    w: number,
    h: number,
    transform: Matrix3
  ): void {
    this._flushIfNeeded(texture);
    const color = this._stateManager.color;
    const a = transform.a;
    const b = transform.b;
    const c = transform.c;
    const d = transform.d;
    let ox = transform.tx + pos.x * a + pos.y * c;
    let oy = transform.ty + pos.x * b + pos.y * d;
    if (this._worldTransform) {
      const offset = this._stateManager.offset;
      ox += offset.x;
      oy += offset.y;
    }
    const ax = a * w;
    const cy = c * h;
    const bx = b * w;
    const dy = d * h;
    const tw = texture ? texture.invWidth : 0.0;
    const th = texture ? texture.invHeight : 0.0;
    const u1 = srcRect.lt.x * tw;
    const v1 = srcRect.lt.y * th;
    const u2 = srcRect.rb.x * tw;
    const v2 = srcRect.rb.y * th;
    const vi = this._quadsCount * 4;
    this.vertex[0] = ox;
    this.vertex[1] = oy;
    this.vertex[2] = u1;
    this.vertex[3] = v1;
    this._vertices.setVertexFromList(vi, this.vertex, color);
    this.vertex[0] = ox + ax;
    this.vertex[1] = oy + bx;
    this.vertex[2] = u2;
    this.vertex[3] = v1;
    this._vertices.setVertexFromList(vi + 1, this.vertex, color);
    this.vertex[0] = ox + cy;
    this.vertex[1] = oy + dy;
    this.vertex[2] = u1;
    this.vertex[3] = v2;
    this._vertices.setVertexFromList(vi + 2, this.vertex, color);
    this.vertex[0] = ox + ax + cy;
    this.vertex[1] = oy + bx + dy;
    this.vertex[2] = u2;
    this.vertex[3] = v2;
    this._vertices.setVertexFromList(vi + 3, this.vertex, color);
    ++this._quadsCount;
  }

  drawVertices(vertices: VertexData, verticesCount: number, primitiveType: PrimitiveType): void {
    this._flush();
    const context = this._renderContext;
    vertices.write(this._vertexBuffer, verticesCount);
    const blend = this._stateManager.blend;
    context.setBlend(blend);
    this._blend = blend;
    let effect = Effect.Color;
    if (this._worldTransform) {
      effect = effect | Effect.Transform;
    }
    const shader = this.renderSupport.resolve(effect);
    shader.setProjection(this._projection);
    context.setShaderProgram(shader.program);
    context.setInputLayout(vertices.inputLayout);
    context.setStreamSource(0, this._vertexBuffer, vertices.vertexSize);
    context.setPrimitiveType(primitiveType);
    context.draw(0, verticesCount);
    this.trianglesCount += getTrianglesCount(primitiveType, verticesCount);
  }

  drawPrimitiveVertices(vertices: PrimitiveVertex[], primitiveType: PrimitiveType): void {
    this._primitives.setVertices(vertices);
    this.drawVertices(this._primitives, vertices.length, primitiveType);
  }

  drawSpriteVertices(texture: Texture, vertices: SpriteVertex[], transform: Matrix3): void {
    if (vertices.length % 4 != 0) {
      throw new Error('vertices.length % 4 != 0');
    }
    this._flushIfNeeded(texture);
    const transformed = Vector2.undefined();
    const vi = this._quadsCount * 4;
    for (let i = 0; i < vertices.length; ++i) {
      const v = vertices[i];
      transform.transformPointInplace(v.pos.x, v.pos.y, transformed);
      this._vertices.setVertex(
        vi + i,
        transformed.x,
        transformed.y,
        v.uv.x,
        v.uv.y,
        v.color.multiply(this._stateManager.color)
      );
    }
    this._quadsCount += vertices.length / 4;
  }

  beginQuads(texture: Texture): void {
    this._flushIfNeeded(texture);
  }

  endQuads(): void {}

  drawQuad(
    src: Rect,
    ltx: number,
    lty: number,
    rbx: number,
    rby: number,
    pos: Vector2,
    scale: Vector2,
    angle: number,
    color: Color4
  ): void {
    if (this._quadsCount + 1 >= this._maxQuadsCount) {
      this._flush();
    }
    let x = pos.x;
    let y = pos.y;
    if (this._worldTransform) {
      const offset = this._stateManager.offset;
      x += offset.x;
      y += offset.y;
    }
    const texture = this._texture;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const a1 = c * scale.x;
    const b1 = -s * scale.y;
    const c1 = s * scale.x;
    const d1 = c * scale.y;
    const vi = this._quadsCount * 4;
    const tw = texture ? texture.invWidth : 0.0;
    const th = texture ? texture.invHeight : 0.0;
    const u1 = src.lt.x * tw;
    const v1 = src.lt.y * th;
    const u2 = src.rb.x * tw;
    const v2 = src.rb.y * th;
    this.vertex[0] = x + a1 * ltx + b1 * lty;
    this.vertex[1] = y + c1 * ltx + d1 * lty;
    this.vertex[2] = u1;
    this.vertex[3] = v1;
    this._vertices.setVertexFromList(vi, this.vertex, color);
    this.vertex[0] = x + a1 * rbx + b1 * lty;
    this.vertex[1] = y + c1 * rbx + d1 * lty;
    this.vertex[2] = u2;
    this.vertex[3] = v1;
    this._vertices.setVertexFromList(vi + 1, this.vertex, color);
    this.vertex[0] = x + a1 * ltx + b1 * rby;
    this.vertex[1] = y + c1 * ltx + d1 * rby;
    this.vertex[2] = u1;
    this.vertex[3] = v2;
    this._vertices.setVertexFromList(vi + 2, this.vertex, color);
    this.vertex[0] = x + a1 * rbx + b1 * rby;
    this.vertex[1] = y + c1 * rbx + d1 * rby;
    this.vertex[2] = u2;
    this.vertex[3] = v2;
    this._vertices.setVertexFromList(vi + 3, this.vertex, color);
    ++this._quadsCount;
  }

  // Allows applying additional scale after calculating initial vertices to adjust by viewport and coordinate system mismatch
  // Probably could be worth to consider calculating this adjustment scale inside SpriteBatchWebGL in setCoordinateSystem -
  // but maybe in some scenarios this scale can differ from the scale TemplateApplication.scale, calculated by ScaleCalculator.
  drawQuadWithExtraScale(
    src: Rect,
    ltx: number,
    lty: number,
    rbx: number,
    rby: number,
    pos: Vector2,
    scale: Vector2,
    extraScale: Vector2, // extra scaling factors for local x and y (e.g., (1, 0.5) will squash vertically)
    angle: number,
    color: Color4
  ): void {
    // Beginning the same as drawQuad
    if (this._quadsCount + 1 >= this._maxQuadsCount) {
      this._flush();
    }
    let x = pos.x;
    let y = pos.y;
    if (this._worldTransform) {
      const offset = this._stateManager.offset;
      x += offset.x;
      y += offset.y;
    }
    const texture = this._texture;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const a1 = c * scale.x;
    const b1 = -s * scale.y;
    const c1 = s * scale.x;
    const d1 = c * scale.y;
    const vi = this._quadsCount * 4;
    const tw = texture ? texture.invWidth : 0.0;
    const th = texture ? texture.invHeight : 0.0;
    const u1 = src.lt.x * tw;
    const v1 = src.lt.y * th;
    const u2 = src.rb.x * tw;
    const v2 = src.rb.y * th;

    // Precompute initial positions for the four vertices (as in drawQuad)
    const v0x = x + a1 * ltx + b1 * lty;
    const v0y = y + c1 * ltx + d1 * lty;
    const v1x = x + a1 * rbx + b1 * lty;
    const v1y = y + c1 * rbx + d1 * lty;
    const v2x = x + a1 * ltx + b1 * rby;
    const v2y = y + c1 * ltx + d1 * rby;
    const v3x = x + a1 * rbx + b1 * rby;
    const v3y = y + c1 * rbx + d1 * rby;

    // Compute the center of the quad
    const centerX = (v0x + v3x) * 0.5;
    const centerY = (v0y + v3y) * 0.5;

    // Helper functions to adjust X and Y by corresponding scaling factor
    const adjustScaleX = (vx: number): number => {
      // Compute offset from center
      const dx = vx - centerX;
      return centerX + dx * extraScale.x;
    };
    const adjustScaleY = (vy: number): number => {
      // Compute offset from center
      const dy = vy - centerY;
      return centerY + dy * extraScale.y;
    };

    this.vertex[0] = adjustScaleX(v0x);
    this.vertex[1] = adjustScaleY(v0y);
    this.vertex[2] = u1;
    this.vertex[3] = v1;
    this._vertices.setVertexFromList(vi, this.vertex, color);

    this.vertex[0] = adjustScaleX(v1x);
    this.vertex[1] = adjustScaleY(v1y);
    this.vertex[2] = u2;
    this.vertex[3] = v1;
    this._vertices.setVertexFromList(vi + 1, this.vertex, color);

    this.vertex[0] = adjustScaleX(v2x);
    this.vertex[1] = adjustScaleY(v2y);
    this.vertex[2] = u1;
    this.vertex[3] = v2;
    this._vertices.setVertexFromList(vi + 2, this.vertex, color);

    this.vertex[0] = adjustScaleX(v3x);
    this.vertex[1] = adjustScaleY(v3y);
    this.vertex[2] = u2;
    this.vertex[3] = v2;
    this._vertices.setVertexFromList(vi + 3, this.vertex, color);

    ++this._quadsCount;
  }

  clear(color: Color4): void {
    this._renderContext.clear(color);
  }

  private _flushIfNeeded(texture: Texture): void {
    if (
      this._texture !== texture ||
      this._effect !== this._stateManager.effect ||
      this._rasterizer !== this._stateManager.rasterizer ||
      this._blend !== this._stateManager.blend ||
      this._imageAdjust !== this._stateManager.imageAdjust ||
      this._mask1 !== this._stateManager.mask1 ||
      this._mask2 !== this._stateManager.mask2 ||
      this._hasColor !== this._stateManager.hasColor ||
      this._quadsCount + 1 >= this._maxQuadsCount ||
      this._worldTransform !== this._stateManager.transform
    ) {
      this._flush();
      this._texture = texture;
    }
  }

  private _flush(): void {
    if (this._quadsCount > 0) {
      const context = this._renderContext;
      this._vertices.write(this._vertexBuffer, this._quadsCount * 4);
      context.setBlend(this._blend);
      context.setRasterizer(this._rasterizer);
      context.setTexture(Shader.DiffuseTextureUnit, this._texture);
      let effectId = this._effect;
      if (this._texture) {
        effectId |= Effect.Texture0;
        effectId |= Effect.PremultAlpha;
      }
      const hasMask = (effectId & Effect.Mask1) !== 0 && this._mask1;
      if (hasMask) {
        if (this._mask2) {
          effectId |= Effect.Mask2;
        }
      }
      if (this._hasColor) {
        effectId |= Effect.Color;
      }
      if (this._worldTransform) {
        effectId |= Effect.Transform;
      }
      const shader = this.renderSupport.resolve(effectId);
      try {
        shader.setProjection(this._projection);
      } catch (e) {
        //logs for bug https://jira.allprojects.info/browse/SLTF-27549
        Log.Trace('Shader exception for effectId ' + effectId);
        Log.Trace('Is shader null? - ' + (!shader).toString());
        throw e;
      }
      if ((effectId & (Effect.ColorAdjust | Effect.ColorOffset)) !== 0) {
        shader.setImageAdjust(this._imageAdjustParams);
      }
      if (hasMask) {
        shader.setMask(0, this._maskParams1);
        context.setTexture(1, this._maskParams1.texture);
        if (this._mask2) {
          shader.setMask(1, this._maskParams2);
          context.setTexture(2, this._maskParams2.texture);
        }
      }
      if (this._worldTransform) {
        shader.setTransform(this._worldTransform);
      }
      context.setShaderProgram(shader.program);
      context.setInputLayout(this._vertices.inputLayout);
      context.setIndexBuffer(this._indexBuffer);
      context.setStreamSource(0, this._vertexBuffer, this._vertices.vertexSize);
      context.setPrimitiveType(PrimitiveType.TriangleList);
      context.drawIndexed(0, this._quadsCount * 6);
      this.trianglesCount += this._quadsCount * 2;
      ++this.batchesCount;
      this._quadsCount = 0;
    }
    this._blend = this._stateManager.blend;
    this._rasterizer = this._stateManager.rasterizer;
    this._effect = this._stateManager.effect;
    this._worldTransform = this._stateManager.transform;
    this._hasColor = this._stateManager.hasColor;
    const imageAdjust = this._stateManager.imageAdjust;
    if (imageAdjust) {
      this._imageAdjustParams.update(imageAdjust);
    } else if (this._imageAdjust) {
      this._imageAdjustParams.update(ImageAdjust.Default);
    }
    this._imageAdjust = imageAdjust;
    const mask1 = this._stateManager.mask1;
    if (mask1) {
      this._maskParams1.update(mask1);
    }
    this._mask1 = mask1;
    const mask2 = this._stateManager.mask2;
    if (mask2) {
      this._maskParams2.update(mask2);
    }
    this._mask2 = mask2;
  }

  private _initVertexBuffer(): void {
    const verticesCount = this._maxQuadsCount * 4;

    // TODO: Commented support for old IEs
    this._vertices = new SpriteVertexDataPacked(verticesCount);
    this._primitives = new PrimitiveVertexData(verticesCount);
    // var isIE = Compatibility.IsIE;
    // this._vertices = isIE
    //   ? new SpriteVertexDataUnpacked(verticesCount)
    //   : new SpriteVertexDataPacked(verticesCount);
    // this._primitives = isIE
    //   ? new PrimitiveVertexDataUnpacked(verticesCount)
    //   : new PrimitiveVertexData(verticesCount);
    const verticesSize = verticesCount * this._vertices.vertexSize;
    this._vertexBuffer = this._renderDevice.createVertexBuffer(
      verticesSize,
      GraphicsResourceUsage.Dynamic
    )!;
  }

  private _initIndexBuffer(): void {
    const indicesCount = this._maxQuadsCount * 6;
    this._indexBuffer = this._renderDevice.createIndexBuffer(
      indicesCount,
      GraphicsResourceUsage.Static
    )!;
    const data = new Int16Array(indicesCount);
    let i = 0;
    let v = 0;
    while (i < indicesCount) {
      data[i] = v;
      data[i + 1] = v + 1;
      data[i + 2] = v + 2;
      data[i + 3] = v + 2;
      data[i + 4] = v + 1;
      data[i + 5] = v + 3;
      i += 6;
      v += 4;
    }
    this._indexBuffer?.fill(0, data);
  }

  contextLost(): void {
    this._indexBuffer?.destroy();
    this._vertexBuffer?.destroy();
    this.renderSupport.contextLost();
  }

  contextReady(): void {
    this._initIndexBuffer();
    this._initVertexBuffer();
    this.renderSupport.contextReady();
    this._renderContext.reset();
  }
}

