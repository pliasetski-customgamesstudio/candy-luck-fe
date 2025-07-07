import { SceneObject, State } from '@cgs/syd';

export class WrapSceneObject extends SceneObject {
  get stateMachine(): State | null {
    return this.childs[0].stateMachine;
  }
}
