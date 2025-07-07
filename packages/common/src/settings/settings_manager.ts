import { ISettingsManager } from './i_serttings_manager';
import { SettingsStore } from './settings_store';
import { ISettingsSection } from './i_settings_section';
import { SettingsExtensions } from '../utils/settings_extensions';
import { ISettingsStore } from './i_settings_store';

export class SettingsManager implements ISettingsManager {
  deleteMainSection(name: string): void {
    const mainStore = new SettingsStore(name);
    mainStore.removeSection(name);
  }

  getMainSection(name: string): ISettingsSection {
    const mainStore = new SettingsStore(name);
    return SettingsExtensions.getOrAddSection(mainStore, name);
  }

  getSettingsStore(name: string): ISettingsStore {
    return new SettingsStore(name);
  }
}
