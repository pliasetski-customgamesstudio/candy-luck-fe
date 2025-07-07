import { OverridingComponentProvider } from '../base_slot_game';

export interface ISlotExtension {
  getInitialRequiredTypes(): symbol[];
  getExtensionComponents(): OverridingComponentProvider[];
}
