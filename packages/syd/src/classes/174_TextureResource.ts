import { Texture } from './41_Texture';
import { TextureSource } from './40_TextureSource';
import { DisposableResource } from './107_DisposableResource';
import { TextureResourceDescription } from './139_TextureResourceDescription';
import { Completer } from './0_Completer';
import { IStreamSubscription } from './22_EventStreamSubscription';

export class TextureResource extends DisposableResource<Texture> implements TextureSource {
  static readonly TypeId: string = 'texture';

  private _description: TextureResourceDescription;
  private _completer: Completer<Texture | null>;
  private _loadSub: IStreamSubscription;
  private _errorSub: IStreamSubscription;

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return TextureResource.TypeId;
  }

  get texture(): Texture | null {
    return this.data;
  }

  get description(): TextureResourceDescription {
    return this._description;
  }

  set description(value: TextureResourceDescription) {
    this._description = value;
  }

  get completer(): Completer<Texture | null> {
    return this._completer;
  }

  set completer(value: Completer<Texture | null>) {
    this._completer = value;
  }

  get loadSub(): IStreamSubscription {
    return this._loadSub;
  }

  set loadSub(value: IStreamSubscription) {
    this._loadSub = value;
  }

  get errorSub(): IStreamSubscription {
    return this._errorSub;
  }

  set errorSub(value: IStreamSubscription) {
    this._errorSub = value;
  }
}
