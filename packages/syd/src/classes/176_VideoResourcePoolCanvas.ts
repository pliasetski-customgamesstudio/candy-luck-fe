import { VideoData } from './108_VideoData';
import { VideoDataCanvas } from './223_VideoDataCanvas';
import { VideoResourcePool } from './254_VideoResourcePool';
import { Platform } from './282_Platform';

export class VideoResourcePoolCanvas extends VideoResourcePool {
  private _platform: Platform;

  constructor(platform: Platform) {
    super('webgl');
    this._platform = platform;
  }

  createData(video: HTMLVideoElement): VideoData {
    return new VideoDataCanvas(this._platform, video);
  }
}
