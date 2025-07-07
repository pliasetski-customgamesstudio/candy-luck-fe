import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { SpriteVertex } from './115_SpriteVertex';
import { PrimitiveVertex } from './128_PrimitiveVertex';
import { Vector2 } from './15_Vector2';
import { RenderSupport } from './241_RenderSupport';
import { PrimitiveType } from './26_PrimitiveType';
import { Texture } from './41_Texture';
import { Matrix3 } from './57_Matrix3';

export abstract class SpriteBatch {
  private _batchesCount: number = 0;
  private _trianglesCount: number = 0;

  get batchesCount(): number {
    return this._batchesCount;
  }

  set batchesCount(value: number) {
    this._batchesCount = value;
  }

  get trianglesCount(): number {
    return this._trianglesCount;
  }

  set trianglesCount(value: number) {
    this._trianglesCount = value;
  }

  constructor(public renderSupport: RenderSupport) {}

  abstract getCoordinateSystem(): Rect;

  abstract setCoordinateSystem(rect: Rect): void;

  abstract setRenderTarget(renderTarget: Texture | null): void;

  abstract getRenderTarget(): Texture | null;

  abstract begin(): void;

  abstract end(): void;

  abstract flush(): void;

  abstract pushState(state: any): void;

  abstract setState(state: any): void;

  abstract popState(state: any): void;

  abstract beginQuads(texture: Texture): void;

  abstract drawQuad(
    src: Rect,
    ltx: number,
    lty: number,
    rbx: number,
    rby: number,
    pos: Vector2,
    scale: Vector2,
    angle: number,
    color: Color4
  ): void;

  abstract drawQuadWithExtraScale(
    src: Rect,
    ltx: number,
    lty: number,
    rbx: number,
    rby: number,
    pos: Vector2,
    scale: Vector2,
    extraScale: Vector2,
    angle: number,
    color: Color4
  ): void;

  abstract endQuads(): void;

  abstract draw(
    texture: Texture,
    srcRect: Rect,
    pos: Vector2,
    w: number,
    h: number,
    transform: Matrix3
  ): void;

  abstract drawPrimitiveVertices(vertices: PrimitiveVertex[], primitiveType: PrimitiveType): void;

  abstract drawSpriteVertices(texture: Texture, vertices: SpriteVertex[], transform: Matrix3): void;

  abstract clear(color: Color4): void;

  drawRect(texture: Texture, srcRect: Rect, dstRect: Rect, transform: Matrix3): void {
    this.draw(texture, srcRect, dstRect.lt, dstRect.width, dstRect.height, transform);
  }

  drawOffset(texture: Texture, srcRect: Rect, offset: Vector2, transform: Matrix3): void {
    this.draw(texture, srcRect, offset, srcRect.width, srcRect.height, transform);
  }

  abstract contextLost(): void;

  abstract contextReady(): void;
}

