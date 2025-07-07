import { Sound } from './187_Sound';
import { AudioDevice } from './196_AudioDevice';
import { AudioResource } from './97_AudioResource';

export class SoundFactory {
  private _audioDevice: AudioDevice;

  constructor(audioDevice: AudioDevice) {
    this._audioDevice = audioDevice;
  }

  createSound(resource: AudioResource): Sound {
    return new Sound(this._audioDevice, resource);
  }
}

export enum SoundState {
  Playing,
  Stopped,
  Paused,
  Destroyed,
}
