import { ResourcePoolImpl } from './147_ResourcePoolImpl';
import { SceneResource } from './100_SceneResource';
import { SceneDescription } from './91_SceneDescription';

export class SceneResourcePool extends ResourcePoolImpl<SceneResource, SceneDescription> {
  createResource(resoruceId: string): SceneResource {
    return new SceneResource(resoruceId);
  }

  loadData(data: string): SceneDescription {
    return new SceneDescription(data);
  }
}
