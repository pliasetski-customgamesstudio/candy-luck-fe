import { AudioDevice } from './196_AudioDevice';
import { AudioDeviceWebAudioApi } from './242_AudioDeviceWebAudioApi';
import { Compatibility } from './16_Compatibility';

export class AudioSystem {
  public readonly audioDevice: AudioDevice;
  private _lastVolume: number | null = null;

  constructor(audioDevice: AudioDevice) {
    this.audioDevice = audioDevice;
  }

  public pause(): void {
    if (this.audioDevice.globalVolume === 0) {
      this._lastVolume = null;
    } else {
      this._lastVolume = this.audioDevice.globalVolume;
      this.audioDevice.globalVolume = 0;
    }
  }

  public async resume(resumeGameMessage: string): Promise<void> {
    if (this._lastVolume === null) {
      return;
    }

    this.audioDevice.globalVolume = this._lastVolume;
    this._lastVolume = null;

    if (this.audioDevice instanceof AudioDeviceWebAudioApi && Compatibility.IsRealMobileBrowser) {
      if (!['closed', 'running'].includes(this.audioDevice.context.state)) {
        alert(resumeGameMessage);
      }
    }
  }
}
