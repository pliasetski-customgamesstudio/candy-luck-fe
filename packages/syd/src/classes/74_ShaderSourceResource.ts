import { Resource } from './8_Resource';

export class ShaderSourceResource extends Resource<string> {
  static readonly TypeId: string = 'source';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return ShaderSourceResource.TypeId;
  }
}
