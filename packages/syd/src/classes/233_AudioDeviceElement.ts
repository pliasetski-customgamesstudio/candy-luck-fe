import { AudioDevice } from './196_AudioDevice';
import { AudioDataSource } from './9_AudioDataSource';
import { AudioData } from './36_AudioData';
import { ElementAudioData } from './216_ElementAudioData';
import { IMediaContainer } from './1_IMediaContainer';
import { AudioSource } from './7_AudioSource';
import { ElementAudioSource } from './158_ElementAudioSource';

export class AudioDeviceElement extends AudioDevice {
  async decodeBuffer(sources: AudioDataSource[]): Promise<AudioData | null> {
    return ElementAudioData.Load(sources);
  }

  async openStreamInContainer(
    sources: AudioDataSource[],
    container: IMediaContainer
  ): Promise<AudioData | null> {
    return ElementAudioData.LoadInContainer(sources, container);
  }

  async openStream(sources: AudioDataSource[]): Promise<AudioData | null> {
    return ElementAudioData.Load(sources);
  }

  createSourceImpl(data: AudioData): AudioSource {
    if (data instanceof ElementAudioData) {
      return new ElementAudioSource(data);
    }
    throw new Error(
      'AudioDeviceElement: tried to create ElementAudioSource with wrong AudioData type'
    );
  }

  destroySourceImpl(source: AudioSource): void {
    source.stop();
  }
}
