import { ISettingsStore } from './i_settings_store';
import { ISettingsSection } from './i_settings_section';
import { SettingsSection } from './settings_section';
import { Cookies } from '@cgs/shared';

export class SettingsStore implements ISettingsStore {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  addSection(name: string): ISettingsSection {
    if (this.sectionExists(name)) {
      throw new Error('Attempt to create existing section');
    }
    return new SettingsSection(this._getSectionFullName(name));
  }

  clear(): void {
    const keys = Object.keys(Cookies.getAll());
    for (const key of keys) {
      if (this._belongsToStore(key)) {
        Cookies.remove(key);
      }
    }
  }

  getSection(name: string): ISettingsSection {
    return new SettingsSection(this._getSectionFullName(name));
  }

  getSections(): ISettingsSection[] {
    return Object.keys(Cookies.getAll())
      .filter((key) => this._belongsToStore(key))
      .map((key) => new SettingsSection(key));
  }

  removeSection(name: string): void {
    Cookies.remove(this._getSectionFullName(name));
  }

  removeSectionSafe(name: string): void {
    this.removeSection(name);
  }

  sectionExists(name: string): boolean {
    return !!Cookies.get(this._getSectionFullName(name));
  }

  private _getSectionFullName(sectionName: string): string {
    return `s_${this._name}_${sectionName}`;
  }

  private _belongsToStore(fullKey: string): boolean {
    return fullKey.startsWith(`s_${this._name}_`);
  }
}
