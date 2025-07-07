import { Resource } from './8_Resource';

export class JSONResource extends Resource<Record<string, any>> {
  static readonly TypeId: string = 'json';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return JSONResource.TypeId;
  }
}
