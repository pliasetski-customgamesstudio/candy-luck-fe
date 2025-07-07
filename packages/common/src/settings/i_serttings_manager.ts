import { ISettingsStore } from './i_settings_store';
import { ISettingsSection } from './i_settings_section';

export const T_ISettingsManager = Symbol('ISettingsManager');
export interface ISettingsManager {
  getSettingsStore(name: string): ISettingsStore;
  getMainSection(name: string): ISettingsSection;
  deleteMainSection(name: string): void;
}
