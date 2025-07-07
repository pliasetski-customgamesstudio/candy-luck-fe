import { VideoSprite } from './98_VideoSprite';
import { VideoDataImpl } from './213_VideoDataImpl';
import { TextureCanvas } from './35_TextureCanvas';
import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';

export class VideoDataCanvasWithAlpha extends VideoDataImpl {
  private _sprite_local: VideoSprite;

  constructor(video: HTMLVideoElement) {
    super(video);
    const w = video.videoWidth;
    const h = video.videoHeight;

    this._sprite_local = new VideoSprite(
      new TextureCanvas(video, w, h),
      new Rect(Vector2.Zero, new Vector2(w, h))
    );
  }

  createSprite(): VideoSprite {
    return this._sprite_local;
  }

  destroySprite(_sprite: VideoSprite): void {}

  updateSprite(_sprite: VideoSprite): void {}
}
