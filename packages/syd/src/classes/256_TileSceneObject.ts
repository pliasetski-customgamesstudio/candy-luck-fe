import { SpriteSceneObject } from './220_SpriteSceneObject';
import { Vector2 } from './15_Vector2';
import { SpriteResource } from './121_SpriteResource';
import { SpriteBatch } from './248_SpriteBatch';
import { Matrix3 } from './57_Matrix3';
import { Texture } from './41_Texture';
import { Rect } from './112_Rect';
import { SceneObjectType } from './SceneObjectType';

export class TileSceneObject extends SpriteSceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Tile;
  }
  offset: Vector2 = Vector2.Zero;

  constructor(spriteResource: SpriteResource) {
    super(spriteResource);
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    const data = this.spriteResource.data;
    if (data) {
      const frameData = data.frames[this.frame];

      let offsetX = 0.0;
      let offsetY = 0.0;
      let leftPartWidth = 0.0;
      let rightPartWidth = 0.0;
      let topPartHeight = 0.0;
      let bottomPartHeight = 0.0;
      let columnCount = 0;
      let rowCount = 0;
      let tmp_x = 0.0; // tmp val for cicles
      let tmp_y = 0.0; // tmp val for cicles
      let tmp_offset = 0.0; // tmp val for cicles

      const sourceRect = frameData.srcRect.clone();

      offsetY = this.offset.y % frameData.size.y;
      if (offsetY < 0) {
        offsetY = frameData.size.y + offsetY;
      }
      topPartHeight = frameData.size.y - offsetY;
      if (isNaN(this.size.x) || isNaN(this.size.y)) {
        console.warn('size is NaN');
        return;
      }
      rowCount = Math.floor((this.size.y - topPartHeight) / frameData.size.y);
      bottomPartHeight = this.size.y - topPartHeight - frameData.size.y * rowCount;

      offsetX = this.offset.x % frameData.size.x;
      if (offsetX < 0) {
        offsetX = frameData.size.x + offsetX;
      }
      leftPartWidth = frameData.size.x - offsetX;
      columnCount = Math.floor((this.size.x - leftPartWidth) / frameData.size.x);
      rightPartWidth = this.size.x - leftPartWidth - frameData.size.x * columnCount;

      if (leftPartWidth > this.size.x) leftPartWidth = this.size.x;
      if (topPartHeight > this.size.y) topPartHeight = this.size.y;

      let srcLeftWidth = sourceRect.size.x;
      let srcLeftX = 0.0;
      let frameOffsetX = frameData.offset.x - offsetX;

      if (frameOffsetX < 0) {
        srcLeftWidth += frameOffsetX;
        srcLeftX = -frameOffsetX;
        frameOffsetX = 0.0;
      }
      const srcRightWidth = rightPartWidth - frameData.offset.x;

      let srcTopHeight = sourceRect.size.y;
      let srcTopY = 0.0;
      let frameOffsetY = frameData.offset.y - offsetY;

      if (frameOffsetY < 0) {
        srcTopHeight += frameOffsetY;
        srcTopY = -frameOffsetY;
        frameOffsetY = 0.0;
      }
      const srcBottomHeight = bottomPartHeight - frameData.offset.y;

      if (srcLeftWidth + frameOffsetX > leftPartWidth) srcLeftWidth = leftPartWidth - frameOffsetX;
      if (srcTopHeight + frameOffsetY > topPartHeight) srcTopHeight = topPartHeight - frameOffsetX;

      let destRect = Rect.fromSize(Vector2.Zero.clone(), new Vector2(srcLeftWidth, srcTopHeight));
      let srcRect = Rect.fromSize(
        new Vector2(sourceRect.lt.x + srcLeftX, sourceRect.lt.y + srcTopY),
        new Vector2(srcLeftWidth, srcTopHeight)
      );

      let dest = destRect.clone();

      // top
      if (srcTopHeight > 0) {
        destRect.lt.x += frameOffsetX;
        destRect.rb.x += frameOffsetX;
        destRect.lt.y += frameOffsetY;
        destRect.rb.y += frameOffsetY;

        if (srcLeftWidth > 0) {
          // left top corner
          this._draw(spriteBatch, data.texture, srcRect, destRect, transform);
          // restore x
          destRect.lt.x = dest.lt.x;
          destRect.rb.x = dest.rb.x;
        }

        destRect.lt.x += leftPartWidth + frameData.offset.x;
        destRect.rb.x += leftPartWidth + frameData.offset.x;

        destRect.rb.x = destRect.lt.x + sourceRect.size.x;
        srcRect.lt.x = sourceRect.lt.x;
        srcRect.rb.x = srcRect.lt.x + sourceRect.size.x;

        // top row
        tmp_x = frameData.size.x;
        for (let column = 0; column < columnCount; ++column) {
          this._draw(spriteBatch, data.texture, srcRect, destRect, transform);

          destRect.lt.x += tmp_x;
          destRect.rb.x += tmp_x;
        }

        if (srcRightWidth > 0) {
          // right top corner
          destRect.rb.x = destRect.lt.x + srcRightWidth;
          srcRect.lt.x = sourceRect.lt.x;
          srcRect.rb.x = srcRect.lt.x + srcRightWidth;
          this._draw(spriteBatch, data.texture, srcRect, destRect, transform);
        }
      }

      // restore x, y
      destRect = dest.clone();

      // center: left and right
      if (rowCount > 0) {
        destRect.rb.y = destRect.lt.y + sourceRect.size.y;
        srcRect.lt.y = sourceRect.lt.y;
        srcRect.rb.y = srcRect.lt.y + sourceRect.size.y;

        if (srcLeftWidth > 0) {
          // left vertical column
          destRect.lt.x += frameOffsetX;
          destRect.rb.x += frameOffsetX;
          destRect.lt.y += topPartHeight + frameData.offset.y;
          destRect.rb.y += topPartHeight + frameData.offset.y;

          destRect.rb.x = destRect.lt.x + srcLeftWidth;
          srcRect.lt.x = sourceRect.lt.x + srcLeftX;
          srcRect.rb.x = srcRect.lt.x + srcLeftWidth;

          tmp_y = frameData.size.y;
          for (let row = 0; row < rowCount; ++row) {
            this._draw(spriteBatch, data.texture, srcRect, destRect, transform);

            destRect.lt.y += tmp_y;
            destRect.rb.y += tmp_y;
          }
          // restore x
          destRect.lt.x = dest.lt.x;
          destRect.rb.x = dest.rb.x;
        }

        if (srcRightWidth > 0) {
          // right vertical column
          // restore y
          destRect.lt.y = dest.lt.y;
          destRect.rb.y = dest.rb.y;

          destRect.rb.y = destRect.lt.y + sourceRect.size.y;

          destRect.lt.x += leftPartWidth + frameData.offset.x + frameData.size.x * columnCount;
          destRect.rb.x += leftPartWidth + frameData.offset.x + frameData.size.x * columnCount;
          destRect.lt.y += topPartHeight + frameData.offset.y;
          destRect.rb.y += topPartHeight + frameData.offset.y;

          destRect.rb.x = destRect.lt.x + srcRightWidth;
          srcRect.lt.x = sourceRect.lt.x;
          srcRect.rb.x = srcRect.lt.x + srcRightWidth;

          tmp_y = frameData.size.y;
          for (let row = 0; row < rowCount; ++row) {
            this._draw(spriteBatch, data.texture, srcRect, destRect, transform);

            destRect.lt.y += tmp_y;
            destRect.rb.y += tmp_y;
          }
          // restore x, y
          destRect = dest.clone();
        }
      }

      // restore x, y
      destRect = dest.clone();

      // bottom
      if (srcBottomHeight > 0) {
        destRect.rb.y = destRect.lt.y + srcBottomHeight;
        srcRect.lt.y = sourceRect.lt.y;
        srcRect.rb.y = srcRect.lt.y + srcBottomHeight;

        destRect.lt.x += frameOffsetX;
        destRect.rb.x += frameOffsetX;
        destRect.lt.y += topPartHeight + frameData.offset.y + frameData.size.y * rowCount;
        destRect.rb.y += topPartHeight + frameData.offset.y + frameData.size.y * rowCount;

        // bottom left corner
        if (srcLeftWidth > 0) {
          destRect.rb.x = destRect.lt.x + srcLeftWidth;
          srcRect.lt.x = sourceRect.lt.x + srcLeftX;
          srcRect.rb.x = srcRect.lt.x + srcLeftWidth;

          this._draw(spriteBatch, data.texture, srcRect, destRect, transform);
        }
        // restore x
        destRect.lt.x = dest.lt.x;
        destRect.rb.x = dest.rb.x;

        destRect.lt.x += leftPartWidth + frameData.offset.x;
        destRect.rb.x += leftPartWidth + frameData.offset.x;

        destRect.rb.x = destRect.lt.x + sourceRect.size.x;
        srcRect.lt.x = sourceRect.lt.x;
        srcRect.rb.x = srcRect.lt.x + sourceRect.size.x;

        tmp_x = frameData.size.x;
        for (let column = 0; column < columnCount; ++column) {
          this._draw(spriteBatch, data.texture, srcRect, destRect, transform);

          destRect.lt.x += tmp_x;
          destRect.rb.x += tmp_x;
        }

        // bottom right corner
        if (srcRightWidth > 0) {
          destRect.rb.x = destRect.lt.x + srcRightWidth;
          srcRect.lt.x = sourceRect.lt.x;
          srcRect.rb.x = srcRect.lt.x + srcRightWidth;
          this._draw(spriteBatch, data.texture, srcRect, destRect, transform);
        }
      }

      // restore x, y
      destRect = dest.clone();

      // central rows and cols
      if (columnCount > 0 && rowCount > 0) {
        srcRect = sourceRect.clone();
        destRect.rb.x = destRect.lt.x + sourceRect.size.x;
        destRect.rb.y = destRect.lt.y + sourceRect.size.y;

        dest = destRect.clone();

        destRect.lt.y += topPartHeight + frameData.offset.y;
        destRect.rb.y += topPartHeight + frameData.offset.y;

        tmp_offset = leftPartWidth + frameData.offset.x;
        tmp_x = frameData.size.x;
        tmp_y = frameData.size.y;

        for (let row = 0; row < rowCount; ++row) {
          destRect.lt.x += tmp_offset;
          destRect.rb.x += tmp_offset;

          for (let column = 0; column < columnCount; ++column) {
            this._draw(spriteBatch, data.texture, srcRect, destRect, transform);

            destRect.lt.x += tmp_x;
            destRect.rb.x += tmp_x;
          }
          destRect.lt.y += tmp_y;
          destRect.rb.y += tmp_y;

          // restore
          destRect.lt.x = dest.lt.x;
          destRect.rb.x = dest.rb.x;
        }
      }
    }
  }

  //temp fix
  private _draw(
    spriteBatch: SpriteBatch,
    texture: Texture,
    srcRect: Rect,
    dstRect: Rect,
    transform: Matrix3
  ): void {
    if (srcRect.width >= 1.0 && srcRect.height >= 1.0) {
      spriteBatch.drawRect(texture, srcRect, dstRect, transform);
    }
  }
}
