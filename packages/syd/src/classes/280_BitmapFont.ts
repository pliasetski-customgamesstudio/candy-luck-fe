import { GlyphCache } from './117_GlyphCache';
import { GlyphLineCache } from './146_GlyphLineCache';
import { Vector2 } from './15_Vector2';
import { TextRenderParameters } from './160_TextRenderParameters';
import { TextureResource } from './174_TextureResource';
import { MultiLineFont } from './18_MultiLineFont';
import { DimensionSourceScale } from './38_DimensionSourceScale';
import { Matrix3 } from './57_Matrix3';
import { Direction } from './62_Direction';
import { VerticalAlignment } from './66_VerticalAlignment';
import { HorizontalAlignment } from './73_HorizontalAlignment';
import { Glyph } from './95_Glyph';
import { DimensionSource } from './131_DimensionSource';
import { Rect } from './112_Rect';

export class BitmapFont extends MultiLineFont {
  private readonly _texture: TextureResource;
  get texture(): TextureResource {
    return this._texture;
  }

  private readonly _glyphs: Map<number, Glyph>;
  private readonly _kernings: Map<number, number> | null = null;
  private readonly _baseOffset: number;
  private readonly _lineHeight: number;

  constructor(
    texture: TextureResource,
    glyphs: Map<number, Glyph>,
    kernings: Map<number, number> | null,
    baseOffset: number,
    lineHeight: number
  ) {
    super();
    this._texture = texture;
    this._glyphs = glyphs;
    this._kernings = kernings;
    this._baseOffset = baseOffset;
    this._lineHeight = lineHeight;
  }

  static pack2int32(first: number, second: number): number {
    return (first << 16) | second;
  }

  getKerningValue(first: number, second: number): number {
    let res = 0;
    if (this._kernings) {
      const key = BitmapFont.pack2int32(first, second);
      if (this._kernings.has(key)) {
        res = this._kernings.get(key)!;
      }
    }
    return res;
  }

  calcBounds(text: string, parameters: TextRenderParameters): Vector2 {
    let code: number;
    let lastCode: number | null = null;
    let width = 0.0;
    const height = this._lineHeight;
    let gl: Glyph | undefined;
    if (this._glyphs.size > 0) {
      for (let i = 0; i < text.length; i++) {
        code = text.charCodeAt(i);
        gl = this._glyphs.get(code);
        if (gl) {
          if (lastCode !== null && parameters.isApplyKerning) {
            width += this.getKerningValue(lastCode, code);
          }
          if (parameters.isApplyAdvance) {
            width += parameters.advance;
          }
          width += gl.advance;
          width += parameters.letterSpacing;
        }
        lastCode = code;
      }
    }
    return new Vector2(width, height);
  }

  splitTextAdjustingScale(
    measureText: any,
    text: string,
    size: Vector2,
    lineSpacing: number,
    dimensionSource: DimensionSource
  ): any[] {
    const lines = text.split('\r\n');
    let res = this.splitText(measureText, text, size.x);
    const textHeight = this._lineHeight * res.length + lineSpacing * (res.length - 1);
    let scaleFactor = 1.0;
    if (dimensionSource === DimensionSource.ProportionalSize && textHeight > size.y) {
      scaleFactor = Math.sqrt((this._lineHeight * measureText(text)) / (size.x * size.y));
      if (scaleFactor < 1.1) {
        scaleFactor = 1.1;
      }
    }
    let iteration = 0;
    while (scaleFactor > 1.0) {
      res = this.splitText(measureText, text, size.x * scaleFactor);
      const newTextHeight = this._lineHeight * res.length + lineSpacing * (lines.length - 1);
      const additionalScale = newTextHeight / (size.y * scaleFactor);
      if (additionalScale <= 1.0 || iteration === 10) {
        break;
      }
      scaleFactor += 0.1;
      iteration++;
    }
    return res;
  }

  draw(
    parameters: TextRenderParameters,
    lines: string[],
    size: Vector2,
    lineSpacing: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment
  ): GlyphLineCache[] {
    const result: GlyphLineCache[] = new Array(lines.length);
    const offset = new Vector2(0.0, 0.0);
    let scaleX = 1.0;
    let scaleY = 1.0;
    let textWidth = 0.0;
    const bounds: Vector2[] = new Array(lines.length);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const b = (bounds[i] = this.calcBounds(line, parameters));
      textWidth = Math.max(textWidth, b.x);
    }
    const textHeight = this._lineHeight * lines.length + lineSpacing * (lines.length - 1);
    switch (parameters.dimensionSource) {
      case DimensionSource.ProportionalSize: {
        const factorX = size.x / textWidth;
        const factorY = size.y / textHeight;
        scaleX = scaleY = factorX < factorY ? factorX : factorY;
        break;
      }
      case DimensionSource.Size: {
        scaleX = size.x / textWidth;
        scaleY = size.y / textHeight;
        break;
      }
    }
    switch (parameters.dimensionSourceScale) {
      case DimensionSourceScale.DownOnly:
        if (scaleX > 1.0) scaleX = 1.0;
        if (scaleY > 1.0) scaleY = 1.0;
        break;
      case DimensionSourceScale.UpOnly:
        if (scaleX < 1.0) scaleX = 1.0;
        if (scaleY < 1.0) scaleY = 1.0;
        break;
    }
    switch (valign) {
      case VerticalAlignment.Center:
        offset.y += (size.y - textHeight * scaleY) * 0.5;
        break;
      case VerticalAlignment.Bottom:
        offset.y += size.y - textHeight * scaleY;
        break;
    }
    for (let i = 0; i < lines.length; i++) {
      result[i] = this.drawMultiLine(
        parameters,
        lines[i],
        bounds[i],
        size,
        lineSpacing,
        halign,
        valign,
        offset.clone(),
        scaleX,
        scaleY
      );
      offset.y += this._lineHeight;
      offset.y += lineSpacing;
    }
    return result;
  }

  drawMultiLine(
    parameters: TextRenderParameters,
    text: string,
    bounds: Vector2,
    size: Vector2,
    lineSpacing: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    offset: Vector2,
    fx: number,
    fy: number
  ): GlyphLineCache {
    let transform: Matrix3 | null = null;
    if (this._glyphs.size > 0) {
      switch (halign) {
        case HorizontalAlignment.Center:
          offset.x = (size.x - bounds.x * fx) * 0.5;
          break;
        case HorizontalAlignment.Right:
          offset.x = size.x - bounds.x * fx;
          break;
      }
      transform = Matrix3.fromScale(fx, fy);
    }
    return this.drawGlyhps(parameters, text, transform, size, bounds, offset);
  }

  drawLine(
    parameters: TextRenderParameters,
    text: string,
    size: Vector2,
    lineSpacing: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    offset: Vector2
  ): GlyphLineCache {
    let transform: Matrix3 | null = null;
    const bounds = this.calcBounds(text, parameters);
    if (this._glyphs.size > 0) {
      switch (parameters.dimensionSource) {
        case DimensionSource.Frame:
          if (parameters.isClip && bounds.x > size.x) {
            if (parameters.direction === Direction.RightToLeft) {
              offset.x += size.x - bounds.x;
            }
          } else {
            switch (halign) {
              case HorizontalAlignment.Center:
                offset.x += (size.x - bounds.x) / 2;
                break;
              case HorizontalAlignment.Right:
                offset.x += size.x - bounds.x;
                break;
            }
          }
          switch (valign) {
            case VerticalAlignment.Center:
              offset.y += (size.y - bounds.y) / 2;
              break;
            case VerticalAlignment.Bottom:
              offset.y += size.y - bounds.y;
              break;
          }
          break;
        case DimensionSource.ProportionalSize: {
          const factorX = size.x / bounds.x;
          const factorY = size.y / bounds.y;
          let fx = factorX < factorY ? factorX : factorY;
          switch (parameters.dimensionSourceScale) {
            case DimensionSourceScale.DownOnly:
              if (fx > 1.0) fx = 1.0;
              break;
            case DimensionSourceScale.UpOnly:
              if (fx < 1.0) fx = 1.0;
              break;
          }
          switch (halign) {
            case HorizontalAlignment.Center:
              offset.x += (size.x - bounds.x * fx) / 2;
              break;
            case HorizontalAlignment.Right:
              offset.x += size.x - bounds.x * fx;
              break;
          }
          switch (valign) {
            case VerticalAlignment.Center:
              offset.y += (size.y - bounds.y * fx) / 2;
              break;
            case VerticalAlignment.Bottom:
              offset.y += size.y - bounds.y * fx;
              break;
          }
          const invfx = 1.0 / fx;
          offset.x *= invfx;
          offset.y *= invfx;
          transform = Matrix3.fromScale(fx, fx);
          break;
        }
        case DimensionSource.Size: {
          let factorX = size.x / bounds.x;
          let factorY = size.y / bounds.y;
          switch (parameters.dimensionSourceScale) {
            case DimensionSourceScale.DownOnly:
              if (factorX > 1.0) factorX = 1.0;
              if (factorY > 1.0) factorY = 1.0;
              break;
            case DimensionSourceScale.UpOnly:
              if (factorX < 1.0) factorX = 1.0;
              if (factorY < 1.0) factorY = 1.0;
              break;
          }
          switch (halign) {
            case HorizontalAlignment.Center:
              offset.x += (size.x - bounds.x * factorX) / 2;
              break;
            case HorizontalAlignment.Right:
              offset.x += size.x - bounds.x * factorX;
              break;
          }
          switch (valign) {
            case VerticalAlignment.Center:
              offset.y -= (size.y - bounds.y * factorY) / 2;
              break;
            case VerticalAlignment.Bottom:
              offset.y -= size.y - bounds.y * factorY;
              break;
          }
          offset.x /= factorX;
          offset.y /= factorY;
          transform = Matrix3.fromScale(factorX, factorY);
          break;
        }
      }
    }
    return this.drawGlyhps(parameters, text, transform, size, bounds, offset);
  }

  drawGlyhps(
    parameters: TextRenderParameters,
    text: string,
    transform: Matrix3 | null,
    size: Vector2,
    bounds: Vector2,
    offset: Vector2
  ): GlyphLineCache {
    let gl: Glyph | undefined;
    let lastCode: number | null = null;
    let code: number;
    let currOffset: number;
    let sourceRect: Rect;
    const result: GlyphCache[] = [];
    if (this._glyphs.size > 0) {
      switch (parameters.direction) {
        case Direction.LeftToRight:
          for (let i = 0; i < text.length; i++) {
            code = text.charCodeAt(i);
            currOffset = 0.0;
            gl = this._glyphs.get(code);
            if (gl) {
              sourceRect = gl.rect;
              if (lastCode !== null && parameters.isApplyKerning) {
                currOffset += this.getKerningValue(lastCode, code);
              }
              if (parameters.isClip) {
                if (offset.x + sourceRect.width > size.x) {
                  break;
                }
              }
              if (parameters.isApplyAdvance) {
                currOffset += parameters.advance;
              }
              currOffset += parameters.letterSpacing;
              currOffset += gl.advance;
              if (sourceRect.width > 0) {
                result.push(new GlyphCache(sourceRect, gl.offset.add(offset)));
              }
              offset.x += currOffset;
            }
            lastCode = code;
          }
          break;
        case Direction.RightToLeft:
          offset.x += bounds.x;
          for (let i = 0; i < text.length; i++) {
            code = text.charCodeAt(i);
            currOffset = 0.0;
            gl = this._glyphs.get(code);
            if (gl) {
              sourceRect = gl.rect;
              if (lastCode !== null && parameters.isApplyKerning) {
                currOffset += this.getKerningValue(lastCode, code);
              }
              if (parameters.isClip) {
                if (offset.x - sourceRect.size.x < 0) {
                  break;
                }
              }
              if (parameters.isApplyAdvance) {
                currOffset += parameters.advance;
              }
              currOffset += parameters.letterSpacing;
              currOffset += gl.advance;
              offset.x -= currOffset;
              result.push(new GlyphCache(sourceRect, gl.offset.add(offset)));
            }
            lastCode = code;
          }
          break;
      }
    }
    return new GlyphLineCache(transform, result);
  }
}
