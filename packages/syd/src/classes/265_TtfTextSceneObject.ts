import { TextSceneObject } from './225_TextSceneObject';
import { TextSprite } from './133_TextSprite';
import { IStreamSubscription } from './22_EventStreamSubscription';
import { TtfFontResource } from './120_TtfFontResource';
import { RenderDevice } from './244_RenderDevice';
import { SpriteBatch } from './248_SpriteBatch';
import { Matrix3 } from './57_Matrix3';
import { TtfFontUtils } from './137_TtfFontUtils';
import { Vector2 } from './15_Vector2';
import { SceneObjectType } from './SceneObjectType';

export class TtfTextSceneObject extends TextSceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Text;
  }
  private _sprite: TextSprite | null = null;

  private readonly _renderDevice: RenderDevice;
  private readonly _fontResource: TtfFontResource;

  private _deviceLost: IStreamSubscription | null = null;

  constructor(renderDevice: RenderDevice, fontResource: TtfFontResource) {
    super();
    this._renderDevice = renderDevice;
    this._fontResource = fontResource;
    this._sprite = null;
    this._deviceLost = null;
  }

  public drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    this.build();
    spriteBatch.drawRect(this._sprite!.texture, this._sprite!.rect, this._sprite!.rect, transform);
  }

  public build(): void {
    if (!this._sprite) {
      this._build();
    }
  }

  private _build(): void {
    const fontFamily: string = TtfFontUtils.getFontFamily(this._fontResource.id);

    this._sprite = this._fontResource.data!.build(
      this.textRenderParams,
      this.textFormated,
      this.size,
      fontFamily,
      this.fontSize,
      this.lineSpacing,
      this.halign,
      this.valign,
      this.isMultiLineText
    );
  }

  public getLines(): string[] | null {
    return this._fontResource && this._fontResource.data
      ? this._fontResource.data.getLines()
      : null;
  }

  public get maximumTextWidth(): number | null {
    return this._fontResource && this._fontResource.data
      ? this._fontResource.data.maximumTextWidth
      : null;
  }

  public calculateTextWidth(text: string): number | null {
    return this._fontResource && this._fontResource.data
      ? this._fontResource.data.measureText(text)
      : null;
  }

  public invalidate(): void {
    this._free();
  }

  public initializeImpl(): void {
    this._deviceLost = this._renderDevice.lost.listen(() => this._onDeviceLost());
  }

  public deinitializeImpl(): void {
    this._free();
    this._deviceLost?.cancel();
  }

  public getTextBounds(): Vector2 {
    this.build();
    return this._sprite!.rect.size.clone();
  }

  private _free(): void {
    if (this._sprite) {
      this._fontResource.data!.dispose(this._sprite);
      this._sprite = null;
    }
  }

  private _onDeviceLost(): void {
    this._free();
  }
}
