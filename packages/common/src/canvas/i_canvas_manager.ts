import { PageInfo } from './page_info';

export const T_ICanvasManager = Symbol('ICanvasManager');

export interface ICanvasManager {
  getPageInfo(): Promise<PageInfo>;
  scrollTo(x: number, y: number): void;
}
