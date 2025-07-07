import { SceneObject } from '@cgs/syd';

export const T_IRootObjectHolder = Symbol('IRootObjectHolder');
export interface IRootObjectHolder {
  root: SceneObject;
}
