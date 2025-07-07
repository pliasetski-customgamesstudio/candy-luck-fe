import { BitmapFontResource } from './126_BitmapFontResource';
import { GlyphLineCache } from './146_GlyphLineCache';
import { Vector2 } from './15_Vector2';
import { TextSceneObject } from './225_TextSceneObject';
import { SpriteBatch } from './248_SpriteBatch';
import { TextFormattingMode } from './51_TextFormattingMode';
import { Matrix3 } from './57_Matrix3';
import { SceneObjectType } from './SceneObjectType';

export class BitmapTextSceneObject extends TextSceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Text;
  }
  private _fontResource: BitmapFontResource;
  private _cache: GlyphLineCache[] | null = null;
  private _lineTransform: Matrix3 = Matrix3.undefined();
  private lineScale: Vector2;

  constructor(fontResource: BitmapFontResource) {
    super();
    this._fontResource = fontResource;
  }

  public drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    if (!this._cache) {
      this._build();
    }
    const texture = this._fontResource.data!.texture.data!;

    for (let i = 0; i < this._cache!.length; ++i) {
      const line = this._cache![i];

      let lineTransform: Matrix3;

      // todo: optimize
      if (line.transform) {
        Matrix3.Multiply(line.transform, transform, this._lineTransform);
        lineTransform = this._lineTransform;
      } else {
        lineTransform = transform;
      }

      if (!this.lineScale) {
        this.lineScale = lineTransform.extractScale();
      }

      for (let j = 0; j < line.glyphs.length; ++j) {
        const g = line.glyphs[j];
        spriteBatch.drawOffset(texture, g.rect, g.offset, lineTransform);
      }
    }
  }

  private _build(): void {
    if (this.isMultiLineText === true) {
      const lines = this.getLines();
      this._cache = this._fontResource.data!.draw(
        this.textRenderParams,
        lines,
        this.size,
        this.lineSpacing,
        this.halign,
        this.valign
      );
    } else {
      this._cache = [
        this._fontResource.data!.drawLine(
          this.textRenderParams,
          this.textFormated,
          this.size,
          this.lineSpacing,
          this.halign,
          this.valign,
          new Vector2(0.0, 0.0)
        ),
      ];
    }
  }

  public getTextBounds(): Vector2 {
    const lines = this.getLines();
    const lineBounds = lines.map((_line) =>
      this._fontResource.data!.calcBounds(this.textFormated, this.textRenderParams)
    );
    const maxLineWidth = lineBounds.map((bounds) => bounds.x).reduce((a, b) => Math.max(a, b));
    const height =
      lineBounds.map((bounds) => bounds.y).reduce((cur, next) => cur + next) +
      this.lineSpacing * (lines.length - 1);
    return new Vector2(maxLineWidth, height);
  }

  private getLines(): any[] {
    const measureText = (txt: string) => {
      return this._fontResource.data!.calcBounds(txt, this.textRenderParams).x;
    };

    return this.textFormattingMode === TextFormattingMode.AdjustToScale
      ? this._fontResource.data!.splitTextAdjustingScale(
          measureText,
          this.textFormated,
          this.size,
          this.lineSpacing,
          this.textRenderParams.dimensionSource
        )
      : this._fontResource.data!.splitText(measureText, this.textFormated, this.size.x);
  }

  public invalidate(): void {
    this._free();
  }

  public deinitializeImpl(): void {
    this._free();
  }

  private _free(): void {
    this._cache = null;
  }
}
