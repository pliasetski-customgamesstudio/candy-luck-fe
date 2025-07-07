import { Action } from '@cgs/syd';
import { SpinMode } from './i_start_slot_action_provider';

export interface IStopSlotActionProvider {
  getStopSlotAction(spinMode: SpinMode): Action;
}
