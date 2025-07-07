import { IViewContext } from './i_view_context';

export const T_IViewContextManager = Symbol('IViewContextManager');
export interface IViewContextManager {
  createViewContext(showSpinner?: boolean): Promise<IViewContext>;
  closeViewContext(viewContext: IViewContext): void;
}
