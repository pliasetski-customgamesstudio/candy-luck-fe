import { ISlotsApiListener } from './i_slots_api_listener';

export abstract class ISlotApiWatcher {
  abstract registerListener(listener: ISlotsApiListener): void;
  abstract unregisterListener(listener: ISlotsApiListener): void;
}
