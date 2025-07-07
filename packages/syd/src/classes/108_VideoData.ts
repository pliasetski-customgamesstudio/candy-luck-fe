import { IDisposable } from './5_Disposable';
import { VideoSprite } from './98_VideoSprite';

export abstract class VideoData implements IDisposable {
  abstract dispose(): void;

  abstract preinit(): void;

  abstract play(looped: boolean): void;

  abstract stop(): void;

  abstract get isCanBePlayed(): boolean;

  abstract getSprite(): VideoSprite | null;

  abstract reset(): void;

  abstract prepareToPlay(): Promise<void>;

  // Add any additional properties or methods here
}
