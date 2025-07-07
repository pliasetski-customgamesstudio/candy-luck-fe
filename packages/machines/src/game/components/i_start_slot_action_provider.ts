import { Action } from '@cgs/syd';

export enum SpinMode {
  Spin,
  ReSpin,
}

export interface IStartSlotActionProvider {
  getStartSlotAction(spinMode: SpinMode): Action;
}
