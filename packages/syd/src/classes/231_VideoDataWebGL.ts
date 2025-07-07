import { VideoDataImpl } from './213_VideoDataImpl';
import { Platform } from './282_Platform';
import { RenderDevice } from './244_RenderDevice';
import { VideoSprite } from './98_VideoSprite';
import { Compatibility } from './16_Compatibility';
import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';

export class VideoDataWebGL extends VideoDataImpl {
  private _platform: Platform;
  private _renderDevice: RenderDevice;

  private _canvas: HTMLCanvasElement;
  private _canvasContext: CanvasRenderingContext2D;

  constructor(platform: Platform, renderDevice: RenderDevice, video: HTMLVideoElement) {
    super(video);
    this._platform = platform;
    this._renderDevice = renderDevice;
  }

  createSprite(): VideoSprite {
    const texture = this._renderDevice.createTextureFromVideo(this.video)!;

    if (Compatibility.IsIE || Compatibility.IsFirefox5) {
      this._canvas = document.createElement('canvas');
      this._canvas.width = texture.width;
      this._canvas.height = texture.height;

      this._canvasContext = this._canvas.getContext('2d')!;
    }

    const sprite = new VideoSprite(
      texture,
      new Rect(Vector2.Zero, new Vector2(texture.width / 2, texture.height))
    );

    return sprite;
  }

  updateSprite(sprite: VideoSprite): void {
    const revision = this._platform.frame;
    if (sprite.revision !== revision) {
      if (this._canvas) {
        this._canvasContext.drawImage(
          this.video,
          0,
          0,
          this._canvas.width,
          this._canvas.height,
          0,
          0,
          this._canvas.width,
          this._canvas.height
        );

        this._renderDevice.updateTextureFromCanvas(sprite.texture, this._canvas);
      } else {
        this._renderDevice.updateTextureFromVideo(sprite.texture, this.video);
      }

      sprite.revision = revision;
    }
  }

  destroySprite(sprite: VideoSprite): void {
    if (sprite.texture) {
      sprite.texture.dispose();
      sprite.texture = null;
    }
  }
}
