import { Key } from 'ts-keycode-enum';
import { IKeyListener } from './101_IKeyListener';
import { TtfFontResource } from './120_TtfFontResource';
import { TextSprite } from './133_TextSprite';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { TextSceneObject } from './225_TextSceneObject';
import { RenderDevice } from './244_RenderDevice';
import { Platform } from './282_Platform';
import { CGSKeyboardEvent } from './42_KeyboardEvent';
import { SceneObject } from './288_SceneObject';
import { Vector2 } from './15_Vector2';
import { TtfFontUtils } from './137_TtfFontUtils';
import { MouseDownEvent } from './177_MouseDownEvent';
import { Matrix3 } from './57_Matrix3';
import { SpriteBatch } from './248_SpriteBatch';
import { IStreamSubscription } from './22_EventStreamSubscription';
import { SceneObjectType } from './SceneObjectType';

export class TtfTextInputSceneObject extends TextSceneObject implements IKeyListener {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.TtfTextEdit;
  }
  private _sprite: TextSprite | null = null;
  private _spriteWithCursor: TextSprite | null = null;
  private _renderedCursorPosition: [number, number] = [-1, -1];

  private readonly _renderDevice: RenderDevice;
  private readonly _fontResource: TtfFontResource;
  private readonly _platform: Platform;

  private _deviceLost: IStreamSubscription;

  private _cursorPosition: number = 0;
  get cursorPosition(): number {
    return this._cursorPosition;
  }

  set cursorPosition(value: number) {
    const newPosition = this._ensureCorrectCursorPosition(value);
    if (newPosition !== this._cursorPosition) {
      this._freeCursor();
    }
    this._cursorPosition = newPosition;
  }

  private _cursorTimer: number = 0.0;

  private _ensureCorrectCursorPosition(value: number): number {
    return Math.max(0, Math.min(value, this.text.length));
  }

  constructor(renderDevice: RenderDevice, fontResource: TtfFontResource, platform: Platform) {
    super();
    this._renderDevice = renderDevice;
    this._fontResource = fontResource;
    this._platform = platform;
    this.touchable = true;
  }

  updateImpl(dt: number): void {
    if (this._platform.inputSystem.keyboard.activeListener === this) {
      this._cursorTimer += dt;
      if (this._cursorTimer > 1) {
        this._cursorTimer = this._cursorTimer - Math.trunc(this._cursorTimer);
      }
    }
    super.updateImpl(dt);
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    if (this._platform.inputSystem.keyboard.activeListener === this && this._cursorTimer < 0.5) {
      this.buildCursor();
      const cursorSprite = this._spriteWithCursor!;
      spriteBatch.drawRect(cursorSprite.texture, cursorSprite.rect, cursorSprite.rect, transform);
    } else {
      this.build();
      spriteBatch.drawRect(
        this._sprite!.texture,
        this._sprite!.rect,
        this._sprite!.rect,
        transform
      );
    }
  }

  buildCursor(): void {
    if (!this._spriteWithCursor) {
      this._buildCursor();
    }
  }

  private _buildCursor(): void {
    const fontFamily = TtfFontUtils.getFontFamily(this._fontResource.id);

    this._spriteWithCursor = this._fontResource.data!.build(
      this.textRenderParams,
      this.textFormated,
      this.size,
      fontFamily,
      this.fontSize,
      this.lineSpacing,
      this.halign,
      this.valign,
      false,
      this.cursorPosition
    );
  }

  build(): void {
    if (!this._sprite) {
      this._build();
    }
  }

  private _build(): void {
    const fontFamily = TtfFontUtils.getFontFamily(this._fontResource.id);

    this._sprite = this._fontResource.data!.build(
      this.textRenderParams,
      this.textFormated,
      this.size,
      fontFamily,
      this.fontSize,
      this.lineSpacing,
      this.halign,
      this.valign,
      false
    );
  }

  getLines(): string[] {
    return this._fontResource && this._fontResource.data ? this._fontResource.data.getLines() : [];
  }

  get maximumTextWidth(): number | null {
    return this._fontResource && this._fontResource.data
      ? this._fontResource.data.maximumTextWidth
      : null;
  }

  calculateTextWidth(text: string): number | null {
    return this._fontResource && this._fontResource.data
      ? this._fontResource.data.measureText(text)
      : null;
  }

  invalidate(): void {
    this._free();
    this._freeCursor();
  }

  initializeImpl(): void {
    this._deviceLost = this._renderDevice.lost.listen(() => this._onDeviceLost());
  }

  deinitializeImpl(): void {
    this._platform.inputSystem.keyboard.removeListener(this);

    this._free();
    this._freeCursor();
    this._deviceLost.cancel();
  }

  activeChanged(active: boolean): void {
    this._platform.inputSystem.keyboard.removeListener(this);
    super.activeChanged(active);
  }

  private _free(): void {
    if (this._sprite) {
      this._fontResource.data!.dispose(this._sprite);
      this._sprite = null;
    }
  }

  private _freeCursor(): void {
    if (this._spriteWithCursor) {
      this._fontResource.data!.dispose(this._spriteWithCursor);
      this._spriteWithCursor = null;
    }
    this._resetCursorTimer();
  }

  private _onDeviceLost(): void {
    this._free();
    this._freeCursor();
  }

  onTouch(event: AbstractMouseEvent): void {
    this.handleMouseEvent(event);
  }

  handleMouseEvent(mouseEvent: AbstractMouseEvent): void {
    if (mouseEvent instanceof MouseDownEvent) {
      if (this.isInPoint(mouseEvent.event.location)) {
        this._platform.inputSystem.keyboard.setActiveListener(this);
        const cursorAndLine = this._calcCursorPosition(mouseEvent.event.location);
        this.cursorPosition = cursorAndLine[0];
      }
    }
  }

  private _resetCursorTimer(): void {
    this._cursorTimer = 0.0;
  }

  private static worldPosition(sceneObject: SceneObject): Vector2 {
    let cur: SceneObject = sceneObject;
    let result: Vector2 = cur.position.clone();
    while (cur.parent) {
      cur = cur.parent;
      result = result.add(cur.position);
      result = result.multiply(cur.scale);
    }
    return result;
  }

  private _calcCursorPosition(touchLocation: Vector2): [number, number] {
    const local = this.inverseTransform.transformVector(touchLocation);

    const fontFamily = TtfFontUtils.getFontFamily(this._fontResource.id);
    const cursorAndLine = this._fontResource.data!.calcCursorPositionForPoint(
      local,
      this.textRenderParams,
      this.textFormated,
      this.size,
      fontFamily,
      this.fontSize,
      this.lineSpacing,
      this.halign,
      this.valign,
      false
    );

    return cursorAndLine;
  }

  onKeyUp(_event: CGSKeyboardEvent): void {}

  onKeyPress(event: CGSKeyboardEvent): void {
    if (event.keyCode === Key.Enter) {
      return;
    }
    if (event.charCode !== 0) {
      const s = String.fromCharCode(event.charCode);
      this.text = this.replaceRange(this.text, this.cursorPosition, this.cursorPosition, s);
      this.cursorPosition++;
      event.accept();
    }
  }

  replaceRange(text: string, start: number, end: number, replacement: string): string {
    return text.substring(0, start) + replacement + text.substring(end);
  }

  onKeyDown(event: CGSKeyboardEvent): void {
    if (event.keyCode === Key.LeftArrow) {
      this.cursorPosition--;
      event.accept();
    } else if (event.keyCode === Key.RightArrow) {
      this.cursorPosition++;
      event.accept();
    } else if (event.keyCode === Key.Home) {
      this.cursorPosition = 0;
      event.accept();
    } else if (event.keyCode === Key.End) {
      this.cursorPosition = this.text.length;
      event.accept();
    } else if (event.keyCode === Key.Delete) {
      if (this.text.length > 0 && this.cursorPosition < this.text.length) {
        this.text = this.replaceRange(this.text, this.cursorPosition, this.cursorPosition + 1, '');
        event.accept();
      }
    } else if (event.keyCode === Key.Backspace) {
      if (this.text.length > 0 && this.cursorPosition > 0) {
        this.text = this.replaceRange(this.text, this.cursorPosition - 1, this.cursorPosition, '');
        this.cursorPosition--;
        event.accept();
      }
    }
  }
}

export type MouseEventHandler = (event: AbstractMouseEvent) => void;
