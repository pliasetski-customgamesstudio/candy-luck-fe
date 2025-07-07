import { SceneObject } from './288_SceneObject';
import { Action } from './84_Action';
import { SceneObjectType } from './SceneObjectType';

export class BuildedNode {
  readonly description: Record<string, any>;
  readonly objectType: SceneObjectType;
  readonly object: SceneObject;
  actions: Action[] | null = null;

  constructor(object: SceneObject, description: Record<string, any>, type: SceneObjectType) {
    this.object = object;
    this.description = description;
    this.objectType = type;
  }
}
