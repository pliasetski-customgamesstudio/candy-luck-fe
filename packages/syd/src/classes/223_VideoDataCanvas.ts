import { VideoDataImpl } from './213_VideoDataImpl';
import { Platform } from './282_Platform';
import { VideoSprite } from './98_VideoSprite';
import { TextureCanvas } from './35_TextureCanvas';
import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';

export class VideoDataCanvas extends VideoDataImpl {
  private _platform: Platform;
  private _alpha: HTMLCanvasElement;
  private _alphaContext: CanvasRenderingContext2D;

  constructor(platform: Platform, video: HTMLVideoElement) {
    super(video);
    this._platform = platform;
  }

  createSprite(): VideoSprite {
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;

    const hw = Math.floor(w / 2);

    if (!this._alpha) {
      this._alpha = document.createElement('canvas');
      this._alpha.width = hw;
      this._alpha.height = h;
      this._alphaContext = this._alpha.getContext('2d')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = hw;
    canvas.height = h;

    const sprite = new VideoSprite(
      new TextureCanvas(canvas, hw, h),
      new Rect(Vector2.Zero, new Vector2(hw, h))
    );

    return sprite;
  }

  destroySprite(_sprite: VideoSprite): void {}

  updateSprite(sprite: VideoSprite): void {
    const revision = this._platform.frame;
    if (sprite.revision !== revision) {
      const t = sprite.texture as TextureCanvas;
      const canvas = t.canvas;

      const w = t.width;
      const h = t.height;

      this._alphaContext.drawImage(this.video, w, 0, w, h, 0, 0, w, h);

      const id = this._alphaContext.getImageData(0, 0, w, h);
      const data = id.data;
      for (let i = data.length - 1; i > 0; i -= 4) {
        data[i] = 255 - data[i - 3];
      }

      const canvasContext = (canvas as HTMLCanvasElement).getContext('2d')!;

      canvasContext.globalCompositeOperation = 'source-over';
      this._alphaContext.putImageData(id, 0, 0);
      canvasContext.drawImage(this.video, 0, 0, w, h, 0, 0, w, h);
      canvasContext.globalCompositeOperation = 'xor';
      canvasContext.drawImage(this._alpha, 0, 0);

      sprite.revision = revision;
    }
  }
}
