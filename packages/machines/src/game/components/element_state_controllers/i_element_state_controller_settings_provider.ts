import { ElementControllingEntry, ItemGameStateDelay } from './elements_state_controller';

export interface IElementStateControllerSettingsProvider {
  stateControllerEntries: ElementControllingEntry[];
  entryStateDelays: { [key: string]: ItemGameStateDelay };
}
