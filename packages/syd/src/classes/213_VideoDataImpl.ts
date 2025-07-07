import { VideoData } from './108_VideoData';
import { Compatibility } from './16_Compatibility';
import { EventStreamProvider } from './192_EventStreamProvider';
import { VideoSprite } from './98_VideoSprite';
import { IStreamSubscription } from './22_EventStreamSubscription';

export abstract class VideoDataImpl implements VideoData {
  private _video: HTMLVideoElement;
  private _looped: boolean = false;
  private _playing: boolean = false;
  private _isCanPlay: boolean = false;
  private _resetted: boolean = false;
  private _sprite: VideoSprite | null = null;
  private _firstFrame: VideoSprite | null = null;
  private _endedSubscription: IStreamSubscription | null = null;
  private _onCanPlaySubscription: IStreamSubscription | null = null;
  private _onSuspendSubscription: IStreamSubscription | null = null;

  constructor(video: HTMLVideoElement) {
    this._video = video;
    try {
      this._endedSubscription = EventStreamProvider.subscribeElement(
        this._video,
        'ended',
        (event) => this._onEnded(event)
      );
    } catch (err) {
      this._endedSubscription = null;
    }

    try {
      this._onCanPlaySubscription = EventStreamProvider.subscribeElement(
        this._video,
        'canplay',
        (event) => this._onCanPlay(event)
      );
    } catch (err) {
      this._onCanPlaySubscription = null;
    }

    try {
      this._onSuspendSubscription = EventStreamProvider.subscribeElement(
        this._video,
        'suspend',
        (event) => this._onSuspend(event)
      );
    } catch (err) {
      this._onSuspendSubscription = null;
    }

    this._video.setAttribute('playsinline', '');
  }

  get video(): HTMLVideoElement {
    return this._video;
  }

  async preinit(): Promise<void> {
    try {
      //TODO: HACK FOR NEW CHROME UPDATE
      this._video.loop = true;
      await this._video.play();
      this.stop();
    } catch (e) {
      console.error(`Error on video preinit ${e}`);
    }
  }

  get isCanBePlayed(): boolean {
    return this._isCanPlay;
  }

  private _onCanPlay(_event?: Event): void {
    this._isCanPlay = true;
    if (!this._resetted && !this._firstFrame) {
      this._firstFrame = this.createSprite();
      this.updateSprite(this._firstFrame);
    }
  }

  private _onEnded(_event?: Event): void {
    this._video.pause();
  }

  private _onSuspend(_event?: Event): void {
    console.log('Low battery mod');
    Compatibility.IsLowBatteryModActivated(true);
  }

  private _destroySprites(): void {
    if (this._sprite) {
      this.destroySprite(this._sprite);
      this._sprite = null;
    }

    if (this._firstFrame) {
      this.destroySprite(this._firstFrame);
      this._firstFrame = null;
    }
  }

  reset(): void {
    this._destroySprites();
    this._resetted = true;
  }

  async prepareToPlay(): Promise<void> {
    await this.preinit();

    const waitForSeeked = new Promise<void>((resolve) => {
      const onSeeked = () => {
        this._video.removeEventListener('seeked', onSeeked);
        resolve();
      };

      this._video.addEventListener('seeked', onSeeked);
    });

    if (this._video.readyState >= 1) {
      this._video.currentTime = 0.0;
      await waitForSeeked;
    }
  }

  play(looped: boolean): void {
    this._video.loop = looped;

    // Prevent crashing on "The play() request was interrupted by a call to pause()"
    this._video.play().catch((e) => {
      console.warn(`Exception on playing video, ${e}`);
    });
  }

  stop(): void {
    this._video.pause();
    if (this._video.readyState >= 1) {
      this._video.currentTime = 0.0;
    }
  }

  dispose(): void {
    //Memory leak http://stackoverflow.com/questions/3258587/how-to-properly-unload-destroy-a-video-element
    if (!this._video.paused) {
      this._video.pause();
    }

    if (this._endedSubscription) {
      this._endedSubscription.cancel();
      this._endedSubscription = null;
    }

    if (this._onCanPlaySubscription) {
      this._onCanPlaySubscription.cancel();
      this._onCanPlaySubscription = null;
    }

    if (this._onSuspendSubscription) {
      this._onSuspendSubscription.cancel();
      this._onSuspendSubscription = null;
    }

    this._video.src = '';
    this._video.load();
    this._video.remove();

    this._destroySprites();
  }

  getSprite(): VideoSprite | null {
    if (!this._video) {
      return null;
    }
    if (!this._sprite) {
      if (this._video.seeking) {
        //We can get an invalid frame if try to use a video while seeking
        return null;
      }
      this._sprite = this.createSprite();
    }

    if (this._video.seeking) {
      if (this._video.loop) {
        //Check that _spite has been already updated previously
        if (this._sprite.revision) {
          //Return previous frame
          return this._sprite;
        }
      } else if (this._firstFrame) {
        return this._firstFrame;
      }
    }

    this.updateSprite(this._sprite);

    return this._sprite;
  }

  abstract createSprite(): VideoSprite;

  abstract updateSprite(sprite: VideoSprite): void;

  abstract destroySprite(sprite: VideoSprite): void;
}
