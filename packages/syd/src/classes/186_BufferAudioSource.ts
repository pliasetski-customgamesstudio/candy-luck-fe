import { BufferAudioData } from './165_BufferAudioData';
import { IStreamSubscription } from './22_EventStreamSubscription';
import { EventStreamProvider } from './192_EventStreamProvider';
import { AudioSource } from './7_AudioSource';

export class BufferAudioSource extends AudioSource {
  private _context: AudioContext;
  private _data: BufferAudioData;

  private _gain: GainNode;

  private _source: AudioBufferSourceNode | null = null;
  private _endedSubscription: IStreamSubscription | null = null;

  private _startTime: number;
  private _resumeOffset: number;

  private _loop: boolean = false;
  private _ended: boolean = false;

  private _volumeValue: number = 1.0;
  private _globalVolumeValue: number = 1.0;

  constructor(context: AudioContext, data: BufferAudioData) {
    super();
    this._context = context;
    this._data = data;

    this._gain = this._context.createGain();
    this._gain.connect(this._context.destination);
  }

  setLoop(value: boolean) {
    this._loop = value;

    if (this._source) {
      this._source.loop = value;
    }
  }

  setVolume(value: number) {
    this._volumeValue = value;
    this._applyVolume();
  }

  setGlobalVolume(value: number) {
    this._globalVolumeValue = value;
    this._applyVolume();
  }

  private _applyVolume() {
    this._gain.gain.value = this._volumeValue * this._globalVolumeValue;
  }

  play(): void {
    this.stop();

    try {
      this._createSource();

      this._source!.start(0);
    } catch (e) {
      console.error('Error on creating AudioSource', e);
    }

    this._startTime = this._context.currentTime;
    this._resumeOffset = 0.0;
  }

  stop() {
    this._destroySource();
  }

  pause() {
    this._resumeOffset += this._context.currentTime - this._startTime;
    this._destroySource();
  }

  resume() {
    this._startTime = this._context.currentTime;

    try {
      this._createSource();

      this._source!.start(this._resumeOffset % this._source!.buffer!.duration);
    } catch (e) {
      console.error('Error on creating AudioSource', e);
    }
  }

  private _createSource(): void {
    const source = this._context.createBufferSource();
    source.connect(this._gain);

    source.buffer = this._data.buffer;
    source.loop = this._loop;

    try {
      this._endedSubscription = EventStreamProvider.subscribeTarget(source, 'ended', this._onEnded);
      this._ended = false;
    } catch (_) {
      this._endedSubscription = null;
      this._ended = true;
    }

    this._source = source;
  }

  private _destroySource() {
    if (this._source) {
      this._source.disconnect(0);
      this._source.stop(0);
      this._source = null;

      if (this._endedSubscription) {
        this._endedSubscription.cancel();
        this._endedSubscription = null;
      }
    }
  }

  get isEnded() {
    return !this._source || this._ended;
  }

  private _onEnded(_event?: Event) {
    this._ended = true;
  }
}
