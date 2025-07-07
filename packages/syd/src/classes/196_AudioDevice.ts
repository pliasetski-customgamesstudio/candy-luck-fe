import { AudioSource } from './7_AudioSource';
import { AudioDataSource } from './9_AudioDataSource';
import { AudioData } from './36_AudioData';
import { IMediaContainer } from './1_IMediaContainer';

export abstract class AudioDevice {
  private _sources: AudioSource[] = [];

  private _globalVolume: number = 1.0;

  get globalVolume(): number {
    return this._globalVolume;
  }

  set globalVolume(value: number) {
    this._globalVolume = value;
    for (let i = 0; i < this._sources.length; ++i) {
      const source = this._sources[i];
      source.setGlobalVolume(value);
    }
  }

  abstract decodeBuffer(sources: AudioDataSource[]): Promise<AudioData | null>;

  abstract openStream(sources: AudioDataSource[]): Promise<AudioData | null>;

  abstract openStreamInContainer(
    sources: AudioDataSource[],
    container: IMediaContainer
  ): Promise<AudioData | null>;

  createSource(data: AudioData): AudioSource {
    const result = this.createSourceImpl(data);

    result.setGlobalVolume(this._globalVolume);
    this._sources.push(result);

    return result;
  }

  destroySource(source: AudioSource): void {
    this.destroySourceImpl(source);
    const index = this._sources.indexOf(source);
    if (index !== -1) {
      this._sources.splice(index, 1);
    }
  }

  protected abstract createSourceImpl(data: AudioData): AudioSource;

  protected abstract destroySourceImpl(source: AudioSource): void;
}
