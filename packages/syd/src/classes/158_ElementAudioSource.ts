import { AudioSource } from './7_AudioSource';
import { ElementAudioData } from './216_ElementAudioData';

export class ElementAudioSource extends AudioSource {
  private _data: ElementAudioData;
  private _loop: boolean = false;
  private _volume: number = 1.0;
  private _globalVolumeValue: number = 1.0;

  constructor(data: ElementAudioData) {
    super();
    this._data = data;
    this._data.onCanPlayEvent.listen(() => {
      if (this._data.startAfterLoaded) {
        this.play();
      }
    });
  }

  setLoop(value: boolean) {
    this._data.audio.loop = value;
  }

  setVolume(value: number) {
    this._volume = value;
    this._applyVolume();
  }

  setGlobalVolume(value: number) {
    this._globalVolumeValue = value;
    this._applyVolume();
  }

  private _applyVolume() {
    if (this._data.canPlay) {
      try {
        this._data.audio.volume = this._volume * this._globalVolumeValue;
      } catch (e) {
        //https://jira.allprojects.info/browse/SLTF-25973
        console.error('Cannot _applyVolume: ' + (e?.toString() ?? '(none)'));
      }
    }
  }

  play() {
    if (this._data.canPlay) {
      this._data.startAfterLoaded = false;
      const audio = this._data.audio;
      audio.currentTime = 0.0;
      audio.play();
    } else {
      this._data.startAfterLoaded = true;
    }
  }

  stop() {
    this._data.startAfterLoaded = false;
    if (this._data.canPlay) {
      const audio = this._data.audio;
      if (!audio.ended) {
        audio.pause();
      }
    }
  }

  pause() {
    this._data.startAfterLoaded = false;
    if (this._data.canPlay) {
      this._data.audio.pause();
    }
  }

  resume() {
    if (this._data.canPlay) {
      this._data.audio.play();
    }
  }

  get isEnded() {
    return this._data.audio.ended;
  }
}
