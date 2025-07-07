import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { SpriteVertex } from './115_SpriteVertex';
import { PrimitiveVertex } from './128_PrimitiveVertex';
import { Vector2 } from './15_Vector2';
import { RenderSupport } from './241_RenderSupport';
import { SpriteBatch } from './248_SpriteBatch';
import { Texture } from './41_Texture';
import { Matrix3 } from './57_Matrix3';
import { PrimitiveType } from './26_PrimitiveType';

export class SpriteBatchNull extends SpriteBatch {
  private _coordinateSystem: Rect;

  constructor(renderSupport: RenderSupport) {
    super(renderSupport);
  }

  begin(): void {
    // TODO: implement begin
  }

  beginQuads(_texture: Texture): void {
    // TODO: implement beginQuads
  }

  clear(_color: Color4): void {
    // TODO: implement clear
  }

  draw(
    _texture: Texture,
    _srcRect: Rect,
    _pos: Vector2,
    __w: number,
    _h: number,
    _: Matrix3
  ): void {
    // TODO: implement draw
  }

  drawPrimitiveVertices(_vertices: PrimitiveVertex[], _primitiveType: PrimitiveType): void {
    // TODO: implement drawPrimitiveVertices
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
  ): void {
    // TODO: implement drawQuad
  }

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

  drawSpriteVertices(_texture: Texture, _vertices: SpriteVertex[], _transform: Matrix3): void {
    // TODO: implement drawSpriteVertices
  }

  end(): void {
    // TODO: implement end
  }

  endQuads(): void {
    // TODO: implement endQuads
  }

  flush(): void {
    // TODO: implement flush
  }

  popState(_state: any): void {
    // TODO: implement popState
  }

  pushState(_state: any): void {
    // TODO: implement pushState
  }

  setCoordinateSystem(rect: Rect): void {
    this._coordinateSystem = rect;
  }

  setState(_state: any): void {
    // TODO: implement setState
  }

  getCoordinateSystem(): Rect {
    return this._coordinateSystem;
  }

  setRenderTarget(_renderTarget: Texture): void {
    // TODO: implement setRenderTarget
  }

  getRenderTarget(): Texture | null {
    return null;
  }

  contextLost(): void {
    // TODO: implement contextLost
  }

  contextReady(): void {
    // TODO: implement contextReady
  }
}
