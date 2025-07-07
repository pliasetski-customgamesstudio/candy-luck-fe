import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export class View {
  private readonly _sizeChanged = new EventDispatcher<View>();
  private readonly _canvas: HTMLCanvasElement;
  private _windowWidth: number;
  private _windowHeight: number;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._windowWidth = this._canvas.width;
    this._windowHeight = this._canvas.height;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get width(): number {
    return this._canvas.width;
  }

  get height(): number {
    return this._canvas.height;
  }

  get windowWidth(): number {
    return this._windowWidth;
  }

  get windowHeight(): number {
    return this._windowHeight;
  }

  get sizeChanged(): EventStream<View> {
    return this._sizeChanged.eventStream;
  }

  setWindowSize(width: number, height: number): void {
    this._windowWidth = width;
    this._windowHeight = height;

    this._sizeChanged.dispatchEvent(this);
  }
}
