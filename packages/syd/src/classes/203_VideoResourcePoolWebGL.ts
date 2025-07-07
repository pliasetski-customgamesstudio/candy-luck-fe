import { VideoResourcePool } from './254_VideoResourcePool';
import { Platform } from './282_Platform';
import { RenderDevice } from './244_RenderDevice';
import { VideoData } from './108_VideoData';
import { VideoDataWebGL } from './231_VideoDataWebGL';

export class VideoResourcePoolWebGL extends VideoResourcePool {
  private readonly _platform: Platform;
  private readonly _renderDevice: RenderDevice;

  constructor(platform: Platform, renderDevice: RenderDevice) {
    super('webgl');
    this._platform = platform;
    this._renderDevice = renderDevice;
  }

  createData(video: HTMLVideoElement): VideoData {
    return new VideoDataWebGL(this._platform, this._renderDevice, video);
  }
}
