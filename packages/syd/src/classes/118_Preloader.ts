import { Log } from './81_Log';

export class Preloader {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _preloaderSelector: string;

  constructor(canvas: HTMLCanvasElement, preloaderSelector: string) {
    this._canvas = canvas;
    this._preloaderSelector = preloaderSelector;
  }

  hide(): void {
    const img = document.querySelector(this._preloaderSelector) as HTMLDivElement;

    if (!(window.STANDALONE_APP === 'true')) {
      const topNode = document.querySelector('#top-canvas-node') as HTMLElement;
      topNode.style.display = 'block';
      this._canvas.style.display = 'block';
    } else {
      Log.Warning('Do not hide preloader, standalone preloader will be hidden directly from JS');
    }

    if (img) {
      img.remove();
    }
  }
}
