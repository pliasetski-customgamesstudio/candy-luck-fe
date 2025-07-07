import { Resource } from './8_Resource';
import { BlendState } from './63_BlendState';

export class BlendResource extends Resource<BlendState> {
  static readonly TypeId: string = 'blend';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return BlendResource.TypeId;
  }
}
