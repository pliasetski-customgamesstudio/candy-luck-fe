import { ResizeMode } from './30_ResizeMode';
import { View } from './86_View';
import { isFullscreenMode, PIXEL_RATIO } from './globalFunctions';
import { Compatibility } from './16_Compatibility';

type ListenerFunc = (width: number, height: number) => void;

export class ResizeHandler {
  private _view: View;
  private _resizeMode: ResizeMode;
  private _top: number = 0;
  private _listeners: ListenerFunc[] = [];

  private _lastWH: number[];
  private _widthToHeight: number;
  private _pixelRatio: number;

  constructor(view: View, resizeMode: ResizeMode) {
    this._view = view;
    this._resizeMode = resizeMode;
  }

  set top(top: number) {
    this._top = top;
    this._top = top;
  }

  private resizeCanvasWithoutEvent(): void {
    let originalNewWidth: number = window.innerWidth;
    let originalNewHeight: number = window.innerHeight;

    const isFullScreenMode = isFullscreenMode();

    if (isFullScreenMode) {
      originalNewWidth = window.innerWidth - 50; // border width
      originalNewHeight = window.innerHeight;
    }

    const pixelRatio: number = parseFloat(PIXEL_RATIO?.toString() ?? '1.0');
    let newWidth: number = Math.round(originalNewWidth * pixelRatio);
    let newHeight: number = Math.round(originalNewHeight * pixelRatio);

    if (newWidth > 0 && newHeight > 0) {
      // const oldHeight = this._lastWH[1];
      this._lastWH = [newWidth, newHeight];

      if (this._resizeMode === ResizeMode.ProportionalScale) {
        const newWidthToHeight = originalNewWidth / originalNewHeight;
        if (newWidthToHeight > this._widthToHeight) {
          newWidth = Math.round(newHeight * this._widthToHeight);
          originalNewWidth = Math.round(originalNewHeight * this._widthToHeight);
        } else {
          newHeight = Math.floor(newWidth / this._widthToHeight);
          originalNewHeight = Math.floor(originalNewWidth / this._widthToHeight);
        }
      }

      switch (this._resizeMode) {
        case ResizeMode.Resize:
          this._view.canvas.width = newWidth;
          this._view.canvas.height = newHeight;
          this._view.canvas.style.width = `${originalNewWidth}px`;
          this._view.canvas.style.height = `${originalNewHeight}px`;
          break;

        case ResizeMode.Scale:
        case ResizeMode.ProportionalScale:
          this._view.canvas.width = newWidth;
          this._view.canvas.height = newHeight;
          this._view.canvas.style.width = `${originalNewWidth}px`;
          this._view.canvas.style.height = `${originalNewHeight}px`;
          this._view.canvas.style.top = `${this._top}px`;
          break;
      }

      this._view.setWindowSize(newWidth, newHeight);

      for (let i = 0; i < this._listeners.length; i++) {
        this._listeners[i](newWidth, newHeight);
      }
    }
  }

  private resizeCanvas(event?: Event): void {
    let originalNewWidth: number = window.innerWidth;
    let originalNewHeight: number = window.innerHeight;

    const isFullScreenMode = isFullscreenMode();

    if (isFullScreenMode) {
      originalNewWidth = window.innerWidth;
      originalNewHeight = window.innerHeight;
    }

    const pixelRatio: number = parseFloat(PIXEL_RATIO?.toString() ?? '1.0');
    let newWidth: number = Math.round(originalNewWidth * pixelRatio);
    let newHeight: number = Math.round(originalNewHeight * pixelRatio);

    if (newWidth > 0 && newHeight > 0) {
      // const oldHeight = this._lastWH[1];
      if (this._lastWH[0] !== newWidth || this._lastWH[1] !== newHeight || !event) {
        this._lastWH = [newWidth, newHeight];

        if (this._resizeMode === ResizeMode.ProportionalScale) {
          const newWidthToHeight = originalNewWidth / originalNewHeight;
          if (newWidthToHeight > this._widthToHeight) {
            newWidth = Math.round(newHeight * this._widthToHeight);
            originalNewWidth = Math.round(originalNewHeight * this._widthToHeight);
          } else {
            newHeight = Math.floor(newWidth / this._widthToHeight);
            originalNewHeight = Math.floor(originalNewWidth / this._widthToHeight);
          }
        }

        switch (this._resizeMode) {
          case ResizeMode.Resize:
            this._view.canvas.width = newWidth;
            this._view.canvas.height = newHeight;
            this._view.canvas.style.width = `${originalNewWidth}px`;
            this._view.canvas.style.height = `${originalNewHeight}px`;
            break;

          case ResizeMode.Scale:
          case ResizeMode.ProportionalScale:
            this._view.canvas.width = newWidth;
            this._view.canvas.height = newHeight;
            this._view.canvas.style.width = `${originalNewWidth}px`;
            this._view.canvas.style.height = `${originalNewHeight}px`;
            this._view.canvas.style.top = `${this._top}px`;
            break;
        }

        this._view.setWindowSize(newWidth, newHeight);

        for (let i = 0; i < this._listeners.length; i++) {
          this._listeners[i](newWidth, newHeight);
        }
      }
    }
  }

  private resizeCanvasMobile(): void {
    const container = document.querySelector('#top-canvas-node') as HTMLElement;
    const topPanel = document.querySelector('#top-canvas-panel') as HTMLElement;
    if (topPanel) {
      topPanel.style.display = 'none';
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const isPortrait = windowWidth < windowHeight;

    let originalRatio = 1657 / 768;

    const windowRatio = windowWidth / windowHeight;

    let canvasWidth: number;
    let canvasHeight: number;

    if (isPortrait) {
      originalRatio = 1 / originalRatio;
    }

    if (originalRatio > windowRatio) {
      canvasWidth = windowWidth;
      canvasHeight = Math.floor(canvasWidth / originalRatio);
    } else {
      canvasHeight = windowHeight;
      canvasWidth = Math.floor(canvasHeight * originalRatio);
    }

    if (windowWidth > 0 && windowHeight > 0) {
      container.style.margin = '0px';

      if (isPortrait) {
        this._view.canvas.width = Math.floor(windowWidth * this._pixelRatio);
        this._view.canvas.height = Math.floor(canvasHeight * this._pixelRatio);
        this._view.canvas.style.width = '100%';
        this._view.canvas.style.height = `${canvasHeight}px`;

        container.style.width = '100%';
        container.style.height = `${canvasHeight}px`;
      } else {
        this._view.canvas.width = Math.floor(canvasWidth * this._pixelRatio);
        this._view.canvas.height = Math.floor(windowHeight * this._pixelRatio);
        this._view.canvas.style.width = `${canvasWidth}px`;
        this._view.canvas.style.height = '100%';

        container.style.width = `${canvasWidth}px`;
        container.style.height = '100%';
      }

      this._view.setWindowSize(windowWidth, windowHeight);

      container.style.position = 'absolute';

      container.style.top = '0%';
      container.style.left = '50%';
      container.style.transform = 'translate(-50%, 0%)';
    }

    for (let i = 0; i < this._listeners.length; i++) {
      this._listeners[i](canvasWidth, canvasHeight);
    }
  }

  public async resizeWithDelay(event?: Event): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.resize(event);
  }

  private resize(event?: Event): void {
    if (Compatibility.IsMobileBrowser) {
      this.resizeCanvasMobile();
    } else {
      this.resizeCanvas(event);
    }
    console.log('Canvas resize function was called');
  }

  public touchListener(): void {
    this._widthToHeight = this._view.canvas.width / this._view.canvas.height;
    this._pixelRatio = parseFloat(PIXEL_RATIO?.toString() ?? '1.0');
    this._lastWH = [
      Math.round(window.innerWidth * this._pixelRatio),
      Math.round(window.innerHeight * this._pixelRatio),
    ];

    window.addEventListener('resize', (event) => this.resizeWithDelay(event));
    window.addEventListener('orientationchange', (event) => this.resizeWithDelay(event));
    document.addEventListener('fullscreenchange', (event) => this.resizeWithDelay(event));
    document.addEventListener('mozfullscreenchange', (event) => this.resizeWithDelay(event));
    document.addEventListener('msfullscreenchange', (event) => this.resizeWithDelay(event));
    document.addEventListener('webkitfullscreenchange', (event) => this.resizeWithDelay(event));
    this.resize();
  }

  public listen(listener: ListenerFunc): void {
    this._listeners.push(listener);
  }
}
