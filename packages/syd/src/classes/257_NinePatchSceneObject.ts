import { SpriteSceneObject } from './220_SpriteSceneObject';
import { NinePatchCache } from './54_NinePatchCache';
import { Vector2 } from './15_Vector2';
import { SpriteResource } from './121_SpriteResource';
import { Matrix3 } from './57_Matrix3';
import { SpriteData } from './162_SpriteData';
import { NinePatchFrame } from './180_NinePatchFrame';
import { Rect } from './112_Rect';
import { SpriteBatch } from './248_SpriteBatch';
import { SceneObjectType } from './SceneObjectType';

export class NinePatchSceneObject extends SpriteSceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.NinePatch;
  }

  private _cache: NinePatchCache[] | null = null;

  public set size(v: Vector2) {
    super.size = v;
    this._invalidate();
  }

  public set frame(value: number) {
    super.frame = value;
    this._invalidate();
  }

  constructor(spriteResource: SpriteResource) {
    super(spriteResource);
  }

  private _build(_transform: Matrix3): NinePatchCache[] {
    const result: NinePatchCache[] = [];

    const data: SpriteData = this.spriteResource.data!;
    const frameData: NinePatchFrame = data.frames[super.frame] as NinePatchFrame;

    const sourceRect: Rect = frameData.srcRect.clone();
    const ninePatch: Rect = frameData.ninePatch.clone();
    const sz: Vector2 = super.size.clone();

    sz.x -= frameData.size.x - sourceRect.size.x;
    if (sz.x <= 0) return result;
    sz.y -= frameData.size.y - sourceRect.size.y;
    if (sz.y <= 0) return result;

    const offset: Vector2 = new Vector2(frameData.offset.x, frameData.offset.y);

    let srcLeft: number = ninePatch.lt.x - frameData.offset.x;
    if (srcLeft < 0) srcLeft = 0.0;
    if (srcLeft > sourceRect.size.x) srcLeft = sourceRect.size.x;

    let srcCenterWidth: number = ninePatch.size.x;
    if (srcCenterWidth + srcLeft > sourceRect.size.x) srcCenterWidth = sourceRect.size.x - srcLeft;
    const srcRightWidth: number = sourceRect.size.x - (srcLeft + srcCenterWidth);

    let srcTop: number = ninePatch.lt.y - frameData.offset.y;
    if (srcTop > sourceRect.size.y) srcTop = sourceRect.size.y;

    let srcCenterHeight: number = ninePatch.size.y;
    if (srcCenterHeight + srcTop > sourceRect.size.y) srcCenterHeight = sourceRect.size.y - srcTop;
    const srcBottomHeight: number = sourceRect.size.y - (srcTop + srcCenterHeight);

    let dstLeft: number = srcLeft;
    let dstRightWidth: number = srcRightWidth;
    let dstTop: number = srcTop;
    let dstBottomHeight: number = srcBottomHeight;
    let dstCenterWidth: number = 0.0;
    let dstCenterHeight: number = 0.0;

    if (dstLeft + dstRightWidth > sz.x) {
      const k: number = sz.x / (dstLeft + dstRightWidth);
      dstLeft = dstLeft * k;
      dstRightWidth = dstRightWidth * k;
    } else {
      dstCenterWidth = sz.x - dstLeft - dstRightWidth;
    }

    if (dstTop + dstBottomHeight > sz.y) {
      const k: number = sz.y / (dstTop + dstBottomHeight);
      dstTop = srcTop * k;
      dstBottomHeight = dstBottomHeight * k;
    } else {
      dstCenterHeight = sz.y - dstTop - dstBottomHeight;
    }

    const srcRect: Rect = Rect.fromSize(
      new Vector2(sourceRect.lt.x, sourceRect.lt.y),
      new Vector2(srcLeft, srcTop)
    );
    const destRect: Rect = Rect.fromSize(
      new Vector2(offset.x, offset.y),
      new Vector2(dstLeft, dstTop)
    );
    // const orig: Vector2 = offset.clone();
    // ----------------- top row -------------------
    const x: number = destRect.lt.x;

    // left top
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // center top
    srcRect.lt.x = sourceRect.lt.x + srcLeft;
    srcRect.rb.x = srcRect.lt.x + srcCenterWidth;
    destRect.lt.x += dstLeft;
    destRect.rb.x = destRect.lt.x + dstCenterWidth;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // right top
    srcRect.lt.x = sourceRect.lt.x + srcLeft + srcCenterWidth;
    srcRect.rb.x = srcRect.lt.x + srcRightWidth;
    destRect.lt.x += dstCenterWidth;
    destRect.rb.x = destRect.lt.x + dstRightWidth;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // ----------------- center row ----------------
    destRect.lt.x = x;

    // left center
    srcRect.lt.x = sourceRect.lt.x;
    srcRect.lt.y = sourceRect.lt.y + srcTop;
    srcRect.size = new Vector2(srcLeft, srcCenterHeight);
    destRect.size = new Vector2(dstLeft, dstCenterHeight);
    destRect.lt.y += dstTop;
    destRect.rb.y += dstTop;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // center center
    srcRect.lt.x = sourceRect.lt.x + srcLeft;
    srcRect.rb.x = srcRect.lt.x + srcCenterWidth;
    destRect.lt.x += dstLeft;
    destRect.rb.x = destRect.lt.x + dstCenterWidth;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // right center
    srcRect.lt.x = sourceRect.lt.x + srcLeft + srcCenterWidth;
    srcRect.rb.x = srcRect.lt.x + srcRightWidth;
    destRect.lt.x += dstCenterWidth;
    destRect.rb.x = destRect.lt.x + dstRightWidth;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // ----------------- bottom row ----------------
    destRect.lt.x = x;

    // left bottom
    srcRect.lt.x = sourceRect.lt.x;
    srcRect.lt.y = sourceRect.lt.y + srcTop + srcCenterHeight;
    srcRect.size = new Vector2(srcLeft, srcBottomHeight);
    destRect.size = new Vector2(dstLeft, dstBottomHeight);
    destRect.lt.y += dstCenterHeight;
    destRect.rb.y += dstCenterHeight;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // center bottom
    srcRect.lt.x = sourceRect.lt.x + srcLeft;
    srcRect.rb.x = srcRect.lt.x + srcCenterWidth;
    destRect.lt.x += dstLeft;
    destRect.rb.x = destRect.lt.x + dstCenterWidth;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    // right bottom
    srcRect.lt.x = sourceRect.lt.x + srcLeft + srcCenterWidth;
    srcRect.rb.x = srcRect.lt.x + srcRightWidth;
    destRect.lt.x += dstCenterWidth;
    destRect.rb.x = destRect.lt.x + dstRightWidth;
    result.push(new NinePatchCache(this._clampRect(srcRect.clone(), 1.0), destRect.clone()));

    return result;
  }

  private _clampRect(v: Rect, minNumb: number): Rect {
    if (v.width < minNumb) {
      v.rb.x = v.lt.x + minNumb;
    }
    if (v.height < minNumb) {
      v.rb.y = v.lt.y + minNumb;
    }
    return v;
  }

  public drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    if (!this._cache) {
      this._cache = this._build(transform);
    }

    const texture = this.spriteResource.data!.texture;
    const cache = this._cache;

    for (let i = 0; i < cache.length; ++i) {
      const c = cache[i];
      if (c.dst.width > 0 && c.dst.height > 0) {
        spriteBatch.drawRect(texture, c.src, c.dst, transform);
      }
    }
  }

  private _invalidate(): void {
    this._cache = null;
  }
}
