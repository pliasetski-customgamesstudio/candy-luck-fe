import { BitmapFont } from './280_BitmapFont';
import { Resource } from './8_Resource';

export class BitmapFontResource extends Resource<BitmapFont> {
  static readonly TypeId: string = 'font';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return BitmapFontResource.TypeId;
  }
}
