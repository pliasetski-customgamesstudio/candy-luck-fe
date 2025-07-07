import { VideoResourcePool } from './254_VideoResourcePool';
import { VideoData } from './108_VideoData';
import { VideoDataCanvasWithAlpha } from './200_VideoDataCanvasWithAlpha';

export class VideoResourcePoolCanvasWithAlpha extends VideoResourcePool {
  constructor() {
    super('canvas');
  }

  createData(video: HTMLVideoElement): VideoData {
    return new VideoDataCanvasWithAlpha(video);
  }
}
