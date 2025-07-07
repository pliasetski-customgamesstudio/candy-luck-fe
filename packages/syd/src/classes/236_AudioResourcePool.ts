import { AudioDevice } from './196_AudioDevice';
import { AudioResource } from './97_AudioResource';
import { AudioDataSource } from './9_AudioDataSource';
import { IMediaContainer } from './1_IMediaContainer';
import { AudioData } from './36_AudioData';
import { ResourcePool } from './90_ResourcePool';

export class AudioResourcePool extends ResourcePool<AudioResource> {
  public static readonly Buffer: string = 'audio';
  public static readonly Stream: string = 'sound_stream';

  private readonly _audioDevice: AudioDevice;

  constructor(audioDevice: AudioDevice) {
    super();
    this._audioDevice = audioDevice;
  }

  public get requiresMediaContainer(): boolean {
    return true;
  }

  public async loadResourceData(
    resource: AudioResource,
    xml: HTMLElement,
    container: IMediaContainer | null
  ): Promise<void> {
    const sources: AudioDataSource[] = [];
    for (let i = 0; i < xml.children.length; ++i) {
      const source = xml.children[i];
      sources[i] = new AudioDataSource(source.getAttribute('path')!, source.getAttribute('type')!);
    }

    let task: Promise<AudioData | null>;
    if (xml.nodeName === AudioResourcePool.Buffer) {
      task = this._audioDevice.decodeBuffer(sources);
    } else {
      if (!container) {
        task = this._audioDevice.openStream(sources);
      } else {
        task = this._audioDevice.openStreamInContainer(sources, container);
      }
    }

    task.then((data) => {
      if (data) {
        resource.construct(data);
      }
    });
  }

  public createResource(resoruceId: string): AudioResource {
    const result = new AudioResource(resoruceId);
    return result;
  }
}
