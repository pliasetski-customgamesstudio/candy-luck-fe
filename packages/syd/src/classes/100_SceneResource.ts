import { Resource } from './8_Resource';
import { SceneDescription } from './91_SceneDescription';

export class SceneResource extends Resource<SceneDescription> {
  static TypeId: string = 'scene';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return SceneResource.TypeId;
  }
}
