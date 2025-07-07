import { ViewInfo } from './view_info';

export const T_IViewConfiguration = Symbol('IViewConfiguration');
export interface IViewConfiguration {
  getViewInfo(viewType: symbol): ViewInfo;
  getTypeBySceneName(sceneName: string): symbol;
  getViewsInPackage(packagePath: string): ViewInfo[];
}
