import { Vector2 } from './15_Vector2';
import { TextRenderParameters } from './160_TextRenderParameters';
import { SceneObject } from './288_SceneObject';
import { TextFormattingMode } from './51_TextFormattingMode';
import { VerticalAlignment } from './66_VerticalAlignment';
import { HorizontalAlignment } from './73_HorizontalAlignment';

export abstract class TextSceneObject extends SceneObject {
  readonly textRenderParams: TextRenderParameters = new TextRenderParameters();
  private _isMultiLineText: boolean = false;
  get isMultiLineText(): boolean {
    return this._isMultiLineText;
  }

  private _text: string;
  private _fontSize: number = 14;
  private _lineSpacing: number = 0;
  private _format: string;

  private _halign: HorizontalAlignment = HorizontalAlignment.Left;
  private _valign: VerticalAlignment = VerticalAlignment.Top;

  protected _textFormattingMode: TextFormattingMode = TextFormattingMode.Default;

  get size(): Vector2 {
    return super.size;
  }

  set size(v: Vector2) {
    super.size = v;
    this.invalidate();
  }

  set multiLineText(value: boolean) {
    this._isMultiLineText = value;
    this.invalidate();
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    if (this._text !== value) {
      this._text = value;
      this.invalidate();
    }
  }

  private get _textInternal(): string {
    return this._text || '';
  }

  get format(): string {
    return this._format;
  }

  set format(value: string) {
    this._format = value;
    this.invalidate();
  }

  get fontSize(): number {
    return this._fontSize;
  }

  set fontSize(value: number) {
    this._fontSize = value;
    this.invalidate();
  }

  get lineSpacing(): number {
    return this._lineSpacing;
  }

  set lineSpacing(value: number) {
    this._lineSpacing = value;
    this.invalidate();
  }

  get halign(): HorizontalAlignment {
    return this._halign;
  }

  set halign(value: HorizontalAlignment) {
    this._halign = value;
    this.invalidate();
  }

  get valign(): VerticalAlignment {
    return this._valign;
  }

  set valign(value: VerticalAlignment) {
    this._valign = value;
    this.invalidate();
  }

  get textFormattingMode(): TextFormattingMode {
    return this._textFormattingMode;
  }

  set textFormattingMode(value: TextFormattingMode) {
    this._textFormattingMode = value;
    this.invalidate();
  }

  constructor() {
    super();
  }

  invalidate(): void {}

  get textFormated(): string {
    return !this._format ? this._textInternal : this._format.replace('{0}', this._textInternal);
  }
}
