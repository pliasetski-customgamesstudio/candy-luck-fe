import { Texture } from './41_Texture';

export class TextureCanvas extends Texture {
  private _canvas: CanvasImageSource | null = null;
  public get canvas(): CanvasImageSource | null {
    return this._canvas;
  }

  constructor(canvas: CanvasImageSource, width: number, height: number) {
    super(width, height);
    this._canvas = canvas;
  }

  public dispose(): void {
    this._canvas = null;
  }
}
