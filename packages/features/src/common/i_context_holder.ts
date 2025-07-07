import { IOperationContext } from '@cgs/common';

export const T_IContextHolder = Symbol('IContextHolder');
export interface IContextHolder {
  get rootContext(): IOperationContext;
}
