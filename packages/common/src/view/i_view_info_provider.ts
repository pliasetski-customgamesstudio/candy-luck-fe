import { Tuple } from '@cgs/syd';
import { ViewInfo } from './view_info';

export const T_IViewInfoProvider = Symbol('IViewInfoProvider');
export interface IViewInfoProvider {
  getViewInfos(): Array<Tuple<symbol, ViewInfo>>;
}
