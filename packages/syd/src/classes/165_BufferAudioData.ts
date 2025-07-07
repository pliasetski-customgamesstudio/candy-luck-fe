import { AudioData } from './36_AudioData';
import { AudioDataSource } from './9_AudioDataSource';

export class BufferAudioData extends AudioData {
  private static _audio: HTMLAudioElement = new Audio();
  private static _unsupported: string = '';
  private static _emptySound: Float32Array = new Float32Array(1);

  public static Load(
    context: BaseAudioContext,
    sources: AudioDataSource[],
    shouldBeDisposed: boolean = false
  ): Promise<BufferAudioData | null> {
    let supported: AudioDataSource | null = null;

    try {
      for (const source of sources) {
        if (BufferAudioData._audio.canPlayType(source.type) !== BufferAudioData._unsupported) {
          supported = source;
          break;
        }
      }
    } catch (e) {
      console.warn('Error checking audio type support.', e);
    }

    if (!supported) {
      console.log("can't decode audio buffer. ignoring.");
      return Promise.resolve(null);
    }

    return new Promise<BufferAudioData>((resolve, reject) => {
      const uri = supported!.uri;
      const handleError = (e: any) => {
        console.log(`Can't decode audio buffer. ignoring. ${uri}`, e);
        reject(null);
      };

      const request = new XMLHttpRequest();
      request.open('GET', uri, true);
      request.responseType = 'arraybuffer';

      request.onload = () => {
        context
          .decodeAudioData(request.response, (_bufferData) => {}, handleError)
          .then((b) => {
            resolve(new BufferAudioData(b, shouldBeDisposed));
          })
          .catch(handleError);
      };

      request.onerror = (d) => {
        handleError(d);
      };

      request.send();
    });
  }

  public buffer: AudioBuffer | null = null;
  private _shouldBeDisposed: boolean;

  constructor(buffer: AudioBuffer, shouldBeDisposed: boolean = false) {
    super();
    this.buffer = buffer;
    this._shouldBeDisposed = shouldBeDisposed;
  }

  public dispose(): void {
    if (this._shouldBeDisposed) {
      try {
        if (BufferAudioData._emptySound && this.buffer?.copyToChannel) {
          for (let i = 0; i < this.buffer.numberOfChannels; i++) {
            this.buffer.copyToChannel(BufferAudioData._emptySound, i);
          }
        }
      } catch (err) {
        //ignore
      }
      this.buffer = null;
      this._shouldBeDisposed = false;
    }
  }
}
