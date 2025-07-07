import { TtfFont } from './273_TtfFont';
import { Resource } from './8_Resource';

export class TtfFontResource extends Resource<TtfFont> {
  static readonly TypeId: string = 'ttf';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return TtfFontResource.TypeId;
  }
}
