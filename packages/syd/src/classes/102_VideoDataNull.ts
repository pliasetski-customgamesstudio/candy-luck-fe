import { VideoData } from './108_VideoData';
import { VideoSprite } from './98_VideoSprite';

export class VideoDataNull extends VideoData {
  get isCanBePlayed(): boolean {
    return true;
  }

  dispose(): void {}

  getSprite(): VideoSprite | null {
    return null;
  }

  preinit(): void {}

  play(_looped: boolean): void {}

  stop(): void {}

  reset(): void {}

  prepareToPlay(): Promise<void> {
    return Promise.resolve();
  }
}
