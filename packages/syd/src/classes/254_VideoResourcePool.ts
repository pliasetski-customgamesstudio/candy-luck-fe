import { VideoResource } from './92_VideoResource';
import { IMediaContainer } from './1_IMediaContainer';
import { VideoData } from './108_VideoData';
import { VideoDataNull } from './102_VideoDataNull';
import { Log } from './81_Log';
import { ResourcePool } from './90_ResourcePool';

export abstract class VideoResourcePool extends ResourcePool<VideoResource> {
  private _type: string;

  constructor(type: string) {
    super();
    this._type = type;
  }

  public get requiresMediaContainer(): boolean {
    return true;
  }

  public async loadResourceData(
    resource: VideoResource,
    xml: HTMLElement,
    container: IMediaContainer | null
  ): Promise<void> {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // More specific CORS policy
    video.setAttribute('playsinline', ''); // Required for iOS
    video.setAttribute('webkit-playsinline', ''); // For older iOS versions
    video.muted = true;
    video.autoplay = false;
    video.controls = false;
    video.loop = false;
    video.preload = 'metadata';
    video.hidden = true;
    video.style.display = 'none';

    video.addEventListener('error', (e) => {
      console.error('Video error:', video.error);
      console.error('Error event:', e);
    });

    let el: HTMLElement;
    for (let i = 0; i < xml.childNodes.length; ++i) {
      el = xml.childNodes[i] as HTMLElement;

      if (el.nodeName === this._type) {
        const pathAttribute = el.getAttribute('path')!;
        const typeAttribute = el.getAttribute('type')!;
        const source = document.createElement('source');
        source.src = pathAttribute;
        source.type = typeAttribute;
        if (source.src.endsWith('.mp4')) {
          video.insertBefore(source, video.firstChild);
        } else {
          video.appendChild(source);
        }
      }
    }

    const completer = new Promise<void>((resolve) => {
      const complete = async () => {
        video.removeEventListener('canplaythrough', complete);
        video.removeEventListener('error', onError);

        const videoData = this.createData(video);
        await videoData.prepareToPlay();
        resource.construct(videoData);
        resolve();
      };

      const onError = (e: Event) => {
        const targetElement = e.target as HTMLVideoElement;
        if (targetElement.error) {
          Log.Error(`Video: ${this._errorMessage(targetElement.error.code)}`);
        } else {
          Log.Error('Video: An unknown error occurred.');
        }

        video.removeEventListener('canplaythrough', complete);
        video.removeEventListener('error', onError);

        video.src = '';
        video.load();

        video.remove();

        resource.construct(new VideoDataNull());
        resolve();
      };

      const _loadSub = video.addEventListener('canplaythrough', complete);
      const _errorSub = video.addEventListener('error', onError);

      if (!container || !container.isValidContainer()) {
        document.body.appendChild(video);
      } else {
        container.appendToContainer(video);
      }

      video.load();
    });

    return completer;
  }

  public createResource(resoruceId: string): VideoResource {
    return new VideoResource(resoruceId);
  }

  public abstract createData(video: HTMLVideoElement): VideoData;

  public contextLost(): void {
    for (const v of this.resources.values()) {
      if (v.data) {
        v.data.reset();
      }
    }
  }

  private _errorMessage(code: number): string {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'You aborted the video playback.';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'A network error caused the video download to fail part-way.';
      case MediaError.MEDIA_ERR_DECODE:
        return 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
      default:
        return 'An unknown error occurred.';
    }
  }
}
