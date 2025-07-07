import { IDisposable, SceneObject } from '@cgs/syd';

export interface IResourceManager extends IDisposable {
  clear(sourceFile: string): void;
  getScene(sourceFile: string, cache?: boolean): SceneObject;
}
