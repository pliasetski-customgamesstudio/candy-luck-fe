import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { AudioData } from './36_AudioData';
import { AudioDataSource } from './9_AudioDataSource';
import { IMediaContainer } from './1_IMediaContainer';

export class ElementAudioData extends AudioData {
  audio: HTMLAudioElement;
  static loadedCounter: number = 0;

  canPlay: boolean = false;
  startAfterLoaded: boolean = false;
  private _canPlayDispatcher: EventDispatcher<boolean> = new EventDispatcher<boolean>();

  get onCanPlayEvent(): EventStream<boolean> {
    return this._canPlayDispatcher.eventStream;
  }

  constructor(audio: HTMLAudioElement) {
    super();
    this.audio = audio;
  }

  dispose(): void {
    this.audio.remove();
    ElementAudioData.loadedCounter--;
  }

  static LoadInContainer(
    sources: AudioDataSource[],
    container: IMediaContainer | null
  ): Promise<ElementAudioData | null> {
    const audio = new HTMLAudioElement();
    audio.crossOrigin = '*';
    audio.controls = false;
    audio.autoplay = false;

    sources.forEach((s) => {
      const source = new HTMLSourceElement();
      source.src = s.uri;
      source.type = s.type;
      audio.append(source);
    });

    const completer = new Promise<ElementAudioData | null>((resolve) => {
      let completed = false;
      let audioElement: ElementAudioData;

      audio.onloadeddata = () => {
        console.log(
          `Audio: Loaded AudioElement. Total: ${++ElementAudioData.loadedCounter}, url: ${
            sources[0].uri
          }`
        );
        audio.onloadeddata = null;
        audio.onerror = null;
        audioElement = new ElementAudioData(audio);
        resolve(audioElement);
        completed = true;
      };

      audio.oncanplaythrough = () => {
        console.log(`Audio: CanPlayThrough AudioElement, url: ${sources[0].uri}`);
        audio.oncanplaythrough = null;
        audioElement.canPlay = true;
        if (audioElement.startAfterLoaded) {
          audioElement._canPlayDispatcher.dispatchEvent();
        }
      };

      audio.onerror = () => {
        console.error(`Audio: url: ${sources[0].uri}, ${'problem with loading audio'}`);
        audio.onloadeddata = null;
        audio.oncanplaythrough = null;
        audio.onerror = null;

        if (!completed) {
          audio.remove();
        }

        if (!completed) {
          resolve(null);
        }
      };
    });

    if (!container || !container.isValidContainer()) {
      document.body.append(audio);
    } else {
      container.appendToContainer(audio);
    }

    audio.load();

    return completer;
  }

  static Load(sources: AudioDataSource[]): Promise<ElementAudioData | null> {
    return ElementAudioData.LoadInContainer(sources, null);
  }

  private _errorMessage(code: number): string {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'You aborted the audio playback.';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'A network error caused the audio download to fail part-way.';
      case MediaError.MEDIA_ERR_DECODE:
        return 'The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support.';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'The audio could not be loaded, either because the server or network failed or because the format is not supported.';
      default:
        return 'An unknown error occurred.';
    }
  }
}
