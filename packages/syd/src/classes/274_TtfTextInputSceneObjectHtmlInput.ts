import { TtfFontResource } from './120_TtfFontResource';
import { Vector2 } from './15_Vector2';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { MouseDownEvent } from './177_MouseDownEvent';
import { TextSceneObject } from './225_TextSceneObject';
import { SpriteBatch } from './248_SpriteBatch';
import { Matrix3 } from './57_Matrix3';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream, IStreamSubscription } from './22_EventStreamSubscription';
import { Color4 } from './10_Color4';
import { EventStreamProvider } from './192_EventStreamProvider';
import { Log } from './81_Log';
import { SceneObjectType } from './SceneObjectType';

export class TtfTextInputSceneObjectHtmlInput extends TextSceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.TtfTextEdit;
  }
  private _resource: TtfFontResource;
  private _canvas: HTMLCanvasElement;
  private _input: HTMLInputElement;
  private _isTextChanged: boolean = false;
  private _placeHolderText: string;
  private _inputOnKeyUpSubscription: IStreamSubscription | null = null;
  private _inputOnCutSubscription: IStreamSubscription | null = null;
  private _inputOnPasteSubscription: IStreamSubscription | null = null;
  private _textChanged: EventDispatcher<string> = new EventDispatcher();
  get textChanged(): EventStream<string> {
    return this._textChanged.eventStream;
  }

  private _lastCanvasWidth: number;
  private _lastCanvasHeight: number;
  private _lastRb: Vector2 = Vector2.undefined();

  set text(value: string) {
    if (!this._input) {
      this._placeHolderText = value;
    } else {
      if (this._input.value != value) {
        this._input.value = value;
      }
      super.text = value;
    }
  }

  get text(): string {
    if (!this._input) {
      return this._placeHolderText;
    }
    return super.text;
  }

  constructor(resource: TtfFontResource, canvas: HTMLCanvasElement) {
    super();
    this._resource = resource;
    this._canvas = canvas;
    this.touchable = true;
  }

  initializeImpl(): void {
    if (!this.isInitialized) {
      this._input = document.createElement('input');
      this._input.type = 'text';
      this._input.className = 'overlay';
      this._input.style.position = 'absolute';
      // this._input.style.visibility = "hidden";
      this._input.style.top = '0';
      this._input.style.border = 'none';
      this._input.style.outline = 'none';
      this._input.style.backgroundColor = 'transparent';
      this._input.style.color = !this.color ? Color4.White.asHtml : this.color.asHtml;
      this._input.spellcheck = false;
      this._input.style.fontSize = `${this.fontSize}px`;
      this._input.value = this._placeHolderText || '';
      super.text = this._input.value;
      this._inputOnKeyUpSubscription = EventStreamProvider.subscribeElement(
        this._input,
        'keyup',
        this.fireTextChanged
      );
      this._inputOnCutSubscription = EventStreamProvider.subscribeElement(
        this._input,
        'cut',
        this.fireTextChanged
      );
      this._inputOnPasteSubscription = EventStreamProvider.subscribeElement(
        this._input,
        'paste',
        this.fireTextChanged
      );
      this._canvas.parentElement!.appendChild(this._input);
      this._input.focus();
    }
  }

  onTouch(event: AbstractMouseEvent): void {
    this.handleMouseEvent(event);
  }

  private handleMouseEvent(mouseEvent: AbstractMouseEvent): void {
    if (mouseEvent instanceof MouseDownEvent) {
      // touch
    }
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    const canvasHeight = this._canvas.clientHeight;
    const canvasWidth = this._canvas.clientWidth;
    const rb = transform.transformVector(this.size);
    if (
      canvasHeight !== this._lastCanvasHeight ||
      canvasWidth !== this._lastCanvasWidth ||
      !rb.equals(this._lastRb)
    ) {
      this._lastCanvasHeight = canvasHeight;
      this._lastCanvasWidth = canvasWidth;
      this._lastRb = rb;
      const lt = transform.transformVector(Vector2.Zero);
      const rect = spriteBatch.getCoordinateSystem();
      const projection = Matrix3.undefined();
      const scale = Matrix3.fromScale(canvasWidth / rect.width, canvasHeight / rect.height);
      const translate = Matrix3.fromTranslation(-rect.lt.x, -rect.lt.y);
      Matrix3.Multiply(translate, scale, projection);
      const plt = projection.transformVector(lt);
      const prb = projection.transformVector(rb);
      const fs = this.fontSize * transform.a * projection.a;
      if (
        !isNaN(plt.y) &&
        !isNaN(plt.x) &&
        !isNaN(prb.y) &&
        !isNaN(prb.x) &&
        !isNaN(fs) &&
        isFinite(plt.y) &&
        isFinite(plt.x) &&
        isFinite(prb.y) &&
        isFinite(prb.x) &&
        isFinite(fs)
      ) {
        this._input.style.top = `${plt.y + this._canvas.offsetTop}px`;
        this._input.style.left = `${plt.x + this._canvas.offsetLeft}px`;
        this._input.style.height = `${prb.y - plt.y}px`;
        this._input.style.width = `${prb.x - plt.x}px`;
        this._input.style.fontSize = `${fs}px`;
      } else {
        Log.Error(
          `lt: ${lt} rb: ${rb} plt: ${plt} prb: ${prb} rect: ${rect} scale: ${scale} translate: ${translate} projection: ${projection} fontSize: ${this.fontSize} fs: ${fs} canvasWidth: ${canvasWidth} canvasHeight: ${canvasHeight}`
        );
      }
    }
  }

  deinitializeImpl(): void {
    this._inputOnKeyUpSubscription?.cancel();
    this._inputOnCutSubscription?.cancel();
    this._inputOnPasteSubscription?.cancel();
    this._input.remove();
    super.deinitializeImpl();
  }

  updateImpl(_dt: number): void {
    if (this._isTextChanged) {
      this._textChanged.dispatchEvent(this.text);
      this._isTextChanged = false;
    }
  }

  private fireTextChanged = (_e?: Event): void => {
    if (this.text !== this._input.value) {
      this.text = this._input.value;
      this._isTextChanged = true;
    }
  };

  activeChanged(active: boolean): void {
    this._input.style.visibility = active ? 'visible' : 'hidden';
    if (this._input.style.visibility === 'visible') this._input.focus();
    this._input.value = active ? super.text : '';
    super.activeChanged(active);
  }
}
