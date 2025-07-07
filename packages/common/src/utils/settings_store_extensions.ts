import { ISettingsStore } from '../settings/i_settings_store';
import { ISettingsSection } from '../settings/i_settings_section';

export class SettingsStoreExtensions {
  static getOrAddSection(store: ISettingsStore, sectionName: string): ISettingsSection {
    if (!store.sectionExists(sectionName)) {
      return store.addSection(sectionName);
    }
    return store.getSection(sectionName);
  }
}
