import { SceneObject } from './288_SceneObject';
import { SceneObjectType } from './SceneObjectType';

export class GlowSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Glow;
  }
}
