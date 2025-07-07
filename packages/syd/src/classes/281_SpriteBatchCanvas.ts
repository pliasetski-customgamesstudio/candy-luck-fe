import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { SpriteVertex } from './115_SpriteVertex';
import { PrimitiveVertex } from './128_PrimitiveVertex';
import { Vector2 } from './15_Vector2';
import { Mask } from './211_Mask';
import { RenderSupport } from './241_RenderSupport';
import { SpriteBatch } from './248_SpriteBatch';
import { PrimitiveType } from './26_PrimitiveType';
import { TextureCanvas } from './35_TextureCanvas';
import { Texture } from './41_Texture';
import { Matrix3 } from './57_Matrix3';
import { BlendState } from './63_BlendState';
import { Blend } from './68_Blend';
import { View } from './86_View';
import { Effect, HasEffect } from './89_Effect';
import { EPSILON } from './globalFunctions';
import { StateType } from './261_StateManager';

export class SpriteBatchCanvas extends SpriteBatch {
  private _canvas: HTMLCanvasElement;
  private _tmpCanvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _color: Color4[] = [];
  private _coordinateSystem: Rect;
  private _projection: Matrix3 = Matrix3.Identity;
  private _transform: Matrix3 = Matrix3.undefined();
  private _mask: Mask;
  private _renderTarget: TextureCanvas;
  private _world: Matrix3 | null = null;
  private _offset: Vector2 | null = null;
  private _temp1: Matrix3 = Matrix3.undefined();
  private _temp2: Matrix3 = Matrix3.undefined();

  constructor(view: View, renderSupport: RenderSupport) {
    super(renderSupport);
    this._canvas = view.canvas;
    this._context = view.canvas.getContext('2d')!;
    this._tmpCanvas = new HTMLCanvasElement();
  }

  begin(): void {
    this.batchesCount = 0;
  }

  clear(color: Color4): void {
    this._context.save();
    this._context.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
    if (color == Color4.Transparent) {
      // (Drawing with 0 alpha pretty much means doing nothing)
      this._context.fillStyle = 'rgba(0,0,0,1)';
      this._context.globalCompositeOperation = 'destination-out';
    } else {
      this._context.globalCompositeOperation = 'source-over';
      this._context.fillStyle = color.asHtml;
    }
    const w = this._renderTarget ? this._renderTarget.width : this._canvas.width;
    const h = this._renderTarget ? this._renderTarget.height : this._canvas.height;
    this._context.fillRect(0, 0, w, h);
    this._context.restore();
  }

  flush(): void {}

  private _applyTransform(transform: Matrix3): void {
    if (this._offset) {
      const off = Matrix3.fromTranslation(this._offset.x, this._offset.y);
      Matrix3.Multiply(transform, off, this._temp1);
      transform = this._temp1;
    }
    if (this._world) {
      Matrix3.Multiply(transform, this._world, this._temp2);
      transform = this._temp2;
    }
    Matrix3.Multiply(transform, this._projection, this._transform);
    this._context.setTransform(
      this._transform.a,
      this._transform.b,
      this._transform.c,
      this._transform.d,
      this._transform.tx,
      this._transform.ty
    );
  }

  private _applyMaskTransform(transform: Matrix3): void {
    Matrix3.Multiply(transform, this._projection, this._transform);
    this._context.setTransform(
      this._transform.a,
      this._transform.b,
      this._transform.c,
      this._transform.d,
      this._transform.tx,
      this._transform.ty
    );
  }

  draw(
    texture: Texture,
    srcRect: Rect,
    pos: Vector2,
    w: number,
    h: number,
    transform: Matrix3
  ): void {
    const t = texture as TextureCanvas;
    this._applyTransform(transform);
    if (t && srcRect.width > 0 && srcRect.height > 0) {
      const x = pos.x;
      const y = pos.y;
      const color = this._color.length > 0 ? this._color[this._color.length - 1] : Color4.White;
      //Ignore light colors as canvas can't blend them accurate
      if (
        this._color.length > 0 &&
        color.r < 0.9 &&
        color.g < 0.9 &&
        color.b < 0.9 &&
        color.a < 0.9
      ) {
        const canvas = this._tmpCanvas;
        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d')!;
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = color.asHtml;
        context.fillRect(0, 0, w, h);
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(
          t.canvas!,
          srcRect.lt.x,
          srcRect.lt.y,
          srcRect.width,
          srcRect.height,
          0.0,
          0.0,
          w,
          h
        );
        if (canvas.width != 0.0 && canvas.height != 0.0) {
          this._context.drawImage(canvas, x, y);
        }
      } else {
        this._context.drawImage(
          t.canvas!,
          srcRect.lt.x,
          srcRect.lt.y,
          srcRect.width,
          srcRect.height,
          x,
          y,
          w,
          h
        );
      }
    }
    ++this.batchesCount;
  }

  drawSpriteVertices(texture: Texture, vertices: SpriteVertex[], transform: Matrix3): void {
    this._applyTransform(transform);
    // const t = texture as TextureCanvas;
    const context = this._context;
    context.globalAlpha = vertices[0].color.a;
    context.fillStyle = vertices[0].color.asHtml;
    for (let i = 3; i < vertices.length; i += 4) {
      context.beginPath();
      const v1 = vertices[i - 3];
      const v2 = vertices[i - 2];
      const v3 = vertices[i - 1];
      const v4 = vertices[i];
      if (v1.color.a < EPSILON) {
        continue;
      }
      context.moveTo(v1.pos.x, v1.pos.y);
      context.lineTo(v2.pos.x, v2.pos.y);
      context.lineTo(v4.pos.x, v4.pos.y);
      context.lineTo(v3.pos.x, v3.pos.y);
      context.closePath();
      context.fill();
    }
    this._applyColorState();
  }

  drawPrimitiveVertices(vertices: PrimitiveVertex[], primitiveType: PrimitiveType): void {
    this._context.setTransform(
      this._projection.a,
      this._projection.b,
      this._projection.c,
      this._projection.d,
      this._projection.tx,
      this._projection.ty
    );
    const context = this._context;
    if (primitiveType == PrimitiveType.TriangleStrip) {
      context.beginPath();
      for (let i = 2; i < vertices.length; ++i) {
        const v1 = vertices[i - 2];
        const v2 = vertices[i - 1];
        const v3 = vertices[i];
        context.moveTo(v1.pos.x, v1.pos.y);
        context.lineTo(v2.pos.x, v2.pos.y);
        context.lineTo(v3.pos.x, v3.pos.y);
      }
      context.closePath();
    }
    context.globalAlpha = vertices[0].color.a;
    context.fillStyle = vertices[0].color.asHtml;
    context.fill();
    this._applyColorState();
  }

  beginQuads(_texture: Texture): void {
    // TODO: implement beginQuads
  }

  endQuads(): void {
    // TODO: implement endQuads
  }

  drawQuad(
    _src: Rect,
    _ltx: number,
    _lty: number,
    _rbx: number,
    _rby: number,
    _pos: Vector2,
    _scale: Vector2,
    _angle: number,
    _color: Color4
  ): void {}

  drawQuadWithExtraScale(
    _src: Rect,
    _ltx: number,
    _lty: number,
    _rbx: number,
    _rby: number,
    _pos: Vector2,
    _scale: Vector2,
    _extraScale: Vector2,
    _angle: number,
    _color: Color4
  ): void {}

  end(): void {}

  popState(state: StateType): void {
    if (typeof state === 'number' && HasEffect(state)) {
      if ((state & Effect.Mask1) != 0) {
        this._context.restore();
      }
    } else if (state instanceof Color4) {
      this._color.pop();
      this._applyColorState();
    } else if (state instanceof BlendState) {
      this._context.restore();
    } else if (state instanceof Matrix3) {
      this._world = null;
    } else if (state instanceof Vector2) {
      this._offset = null;
    }
  }

  pushState(state: StateType): void {
    if (typeof state === 'number' && HasEffect(state)) {
      if ((state & Effect.Mask1) != 0) {
        const mask = this._mask;
        this._applyMaskTransform(mask.worldTransform);
        this._context.save();
        this._context.beginPath();
        this._context.rect(
          mask.sourceFrame.lt.x,
          mask.sourceFrame.lt.y,
          mask.sourceFrame.width,
          mask.sourceFrame.height
        );
        this._context.clip();
      }
    } else if (state instanceof Color4) {
      if (this._color.length == 0) {
        this._color.push(state);
      } else {
        this._color.push(this._color[this._color.length - 1].multiply(state));
      }
      this._applyColorState();
    } else if (state instanceof Mask) {
      this._mask = state;
    } else if (state instanceof BlendState) {
      this._setCompositeOperation(state);
    } else if (state instanceof Matrix3) {
      this._world = state;
    } else if (state instanceof Vector2) {
      this._offset = state;
    }
  }

  setCoordinateSystem(rect: Rect): void {
    this._coordinateSystem = rect;
    this._projection = Matrix3.undefined();
    const w = this._renderTarget ? this._renderTarget.width : this._canvas.width;
    const h = this._renderTarget ? this._renderTarget.height : this._canvas.height;
    const scale = Matrix3.fromScale(w / rect.width, h / rect.height);
    const translate = Matrix3.fromTranslation(-rect.lt.x, -rect.lt.y);
    Matrix3.Multiply(translate, scale, this._projection);
  }

  setState(state: StateType): void {
    if (typeof state === 'number' && HasEffect(state)) {
      if ((state & Effect.Mask1) != 0) {
        const mask = this._mask;
        this._applyMaskTransform(mask.worldTransform);
        this._context.save();
        this._context.beginPath();
        this._context.rect(
          mask.sourceFrame.lt.x,
          mask.sourceFrame.lt.y,
          mask.sourceFrame.width,
          mask.sourceFrame.height
        );
        this._context.clip();
      }
    } else if (state instanceof Color4) {
      this._color.push(state);
      this._applyColorState();
    } else if (state instanceof BlendState) {
      this._setCompositeOperation(state);
    }
  }

  private _setCompositeOperation(state: BlendState): void {
    let operation: string = 'source-over';
    if (state.src == Blend.One && state.dst == Blend.InvSrcAlpha) {
      operation = 'source-over';
    } else if (state.src == Blend.One && state.dst == Blend.One) {
      operation = 'lighter';
    } else if (state.src == Blend.Zero && state.dst == Blend.Zero) {
      //it suppose to be copy. But we need black background.
      //operation = "copy"; ???
    } else if (state.src == Blend.SrcAlpha && state.dst == Blend.InvSrcAlpha) {
      operation = 'source-atop';
    } else {
      //Not implemented composition
      //assert(false);
    }
    this._context.save();
    this._context.globalCompositeOperation = operation as GlobalCompositeOperation;
  }

  private _applyColorState(): void {
    this._context.globalAlpha =
      this._color.length > 0 ? this._color[this._color.length - 1].a : 1.0;
  }

  getCoordinateSystem(): Rect {
    return this._coordinateSystem;
  }

  setRenderTarget(renderTarget: Texture): void {
    this._renderTarget = renderTarget as TextureCanvas;
    if (renderTarget) {
      const t = renderTarget as TextureCanvas;
      this._context = (t.canvas as HTMLCanvasElement).getContext('2d')!;
    } else {
      this._context = this._canvas.getContext('2d')!;
    }
    this._applyColorState();
  }

  getRenderTarget(): Texture | null {
    return this._renderTarget;
  }

  contextLost(): void {}

  contextReady(): void {}
}
