import { SpriteResource } from './121_SpriteResource';
import { SpriteData } from './162_SpriteData';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream, IStreamSubscription } from './22_EventStreamSubscription';

export class HttpSpriteResource extends SpriteResource {
  private _dataLoaded: EventDispatcher<HttpSpriteResource> =
    new EventDispatcher<HttpSpriteResource>();
  private _errorOccurred: EventDispatcher<HttpSpriteResource> =
    new EventDispatcher<HttpSpriteResource>();

  private _loadSub: IStreamSubscription | null = null;
  get loadSub(): IStreamSubscription | null {
    return this._loadSub;
  }

  set loadSub(value: IStreamSubscription | null) {
    this._loadSub = value;
  }

  private _errorSub: IStreamSubscription | null = null;
  get errorSub(): IStreamSubscription | null {
    return this._errorSub;
  }

  set errorSub(value: IStreamSubscription | null) {
    this._errorSub = value;
  }

  private _error: any;
  get error(): any {
    return this._error;
  }

  private _image: HTMLImageElement | null = null;
  get image(): HTMLImageElement | null {
    return this._image;
  }

  set image(value: HTMLImageElement | null) {
    this._image = value;
  }

  constructor(id: string) {
    super(id);
  }

  get dataLoaded(): EventStream<HttpSpriteResource> {
    return this._dataLoaded.eventStream;
  }

  get errorOccurred(): EventStream<HttpSpriteResource> {
    return this._errorOccurred.eventStream;
  }

  complete(data: SpriteData): void {
    this.construct(data);
    this._dataLoaded.dispatchEvent(this);
  }

  completeError(error: any): void {
    this._error = error;
    this._errorOccurred.dispatchEvent(this);
  }
}
