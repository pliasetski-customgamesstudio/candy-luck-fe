import { AudioDevice } from './196_AudioDevice';
import { SoundState } from './207_SoundFactory';
import { AudioSource } from './7_AudioSource';
import { AudioResource } from './97_AudioResource';

export class Sound {
  private _device: AudioDevice;
  private _resource: AudioResource;
  private _source: AudioSource | null = null;
  private _loop: boolean = false;
  private _volume: number = 1.0;
  private _state: SoundState = SoundState.Stopped;

  constructor(device: AudioDevice, resource: AudioResource) {
    this._device = device;
    this._resource = resource;
  }

  get loop(): boolean {
    return this._loop;
  }

  set loop(value: boolean) {
    this._loop = value;

    if (this._source) {
      this._source.setLoop(value);
    }
  }

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
    if (this._source) {
      this._source.setVolume(value);
    }
  }

  get state(): SoundState {
    return this._state;
  }

  play(): void {
    if (
      (this._state === SoundState.Stopped && this._resource.data) ||
      (this._state === SoundState.Paused && this._resource.data) ||
      (this._state === SoundState.Playing && this._source && this._source.isEnded)
    ) {
      if (!this._source) {
        this._source = this._device.createSource(this._resource.data!);

        this._source.setLoop(this._loop);
        this._source.setVolume(this._volume);
      }

      if (this._state === SoundState.Paused && this._source && !this._source.isEnded) {
        this._source.stop();
      }

      this._source.play();
      this._state = SoundState.Playing;
    }
  }

  stop(): void {
    if (this._state === SoundState.Playing || this._state === SoundState.Paused) {
      this._source?.stop();
      this._state = SoundState.Stopped;
    }
  }

  pause(): void {
    if (this._state === SoundState.Playing) {
      this._source?.pause();
      this._state = SoundState.Paused;
    }
  }

  resume(): void {
    if (this._state === SoundState.Paused) {
      this._source?.resume();
      this._state = SoundState.Playing;
    }
  }

  create(): void {
    this._state = SoundState.Stopped;
  }

  destroy(): void {
    if (this._source) {
      this._device.destroySource(this._source);
      this._source = null;
    }

    this._state = SoundState.Destroyed;
  }
}
