import { ElementAudioSource } from './158_ElementAudioSource';
import { BufferAudioData } from './165_BufferAudioData';
import { BufferAudioSource } from './186_BufferAudioSource';
import { AudioDevice } from './196_AudioDevice';
import { AudioData } from './36_AudioData';
import { AudioSource } from './7_AudioSource';
import { AudioDataSource } from './9_AudioDataSource';
import { IMediaContainer } from './1_IMediaContainer';
import { ElementAudioData } from './216_ElementAudioData';

export class AudioDeviceWebAudioApi extends AudioDevice {
  private readonly _context: AudioContext;

  constructor(context: AudioContext) {
    super();
    this._context = context;
  }

  get context(): AudioContext {
    return this._context;
  }

  async openStreamInContainer(
    sources: AudioDataSource[],
    _container: IMediaContainer
  ): Promise<AudioData | null> {
    return BufferAudioData.Load(this._context, sources, true);
  }

  async decodeBuffer(sources: AudioDataSource[]): Promise<AudioData | null> {
    return BufferAudioData.Load(this._context, sources);
  }

  async openStream(sources: AudioDataSource[]): Promise<AudioData | null> {
    return BufferAudioData.Load(this._context, sources, true);
  }

  createSourceImpl(data: BufferAudioData | ElementAudioData): AudioSource {
    if (data instanceof BufferAudioData) {
      return new BufferAudioSource(this._context, data);
    }
    return new ElementAudioSource(data);
  }

  destroySourceImpl(source: AudioSource): void {
    if (source) {
      source.stop();
    }
  }
}
