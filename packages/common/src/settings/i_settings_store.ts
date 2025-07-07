import { ISettingsSection } from './i_settings_section';

export interface ISettingsStore {
  getSection(name: string): ISettingsSection;
  getSections(): Iterable<ISettingsSection>;
  sectionExists(name: string): boolean;
  addSection(name: string): ISettingsSection;
  removeSection(name: string): void;
  removeSectionSafe(name: string): void;
  clear(): void;
}
