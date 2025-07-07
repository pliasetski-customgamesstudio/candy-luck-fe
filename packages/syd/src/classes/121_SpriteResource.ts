import { SpriteData } from './162_SpriteData';
import { Resource } from './8_Resource';

export class SpriteResource extends Resource<SpriteData> {
  static readonly TypeId: string = 'sprite';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return SpriteResource.TypeId;
  }
}
