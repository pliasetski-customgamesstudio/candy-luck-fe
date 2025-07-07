import { Preloader } from './118_Preloader';
import { ResizeMode } from './30_ResizeMode';

export class PlatformSettings {
  antialiasing: boolean;
  forceCanvasRendering: boolean;
  resizeMode: ResizeMode;

  private _top: number = 0;

  constructor(
    antialiasing: boolean = false,
    forceCanvasRendering: boolean = false,
    _enableCompressedTextures: boolean = false,
    resizeMode: ResizeMode = ResizeMode.Resize
  ) {
    this.antialiasing = antialiasing;
    this.forceCanvasRendering = forceCanvasRendering;
    this.resizeMode = resizeMode;
  }

  set top(value: number) {
    this._top = value;
  }

  get top(): number {
    return this._top;
  }

  private _preloader: Preloader;

  set preloader(preloader: Preloader) {
    this._preloader = preloader;
  }

  get preloader(): Preloader {
    return this._preloader;
  }
}
