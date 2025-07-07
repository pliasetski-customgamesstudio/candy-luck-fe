import { SceneObject } from '@cgs/syd';
import { ViewInfo } from './view_info';

export const T_IViewFactory = Symbol('IViewFactory');
export interface IViewFactory {
  createView(viewType: any, sceneHint?: string | null): SceneObject;
  createRootScene(viewInfo: ViewInfo, viewType: any, sceneHint?: string | null): SceneObject;
  addResourceIdSubstitutions(substitutions: Map<string, string>): void;
  removeResourceIdSubstitutions(substitutions: string[]): void;
  getViewInfo(viewType: any): ViewInfo;
  createRootSceneByViewType(viewType: any, sceneHint: string | null): SceneObject;
  resourceFound(viewType: any): boolean;
  loadPackage(path: string): Promise<void>;
}
