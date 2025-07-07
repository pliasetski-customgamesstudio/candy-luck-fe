import { DisposableResource } from './107_DisposableResource';
import { AudioData } from './36_AudioData';

export class AudioResource extends DisposableResource<AudioData> {
  static TypeId = 'audio';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return AudioResource.TypeId;
  }
}
