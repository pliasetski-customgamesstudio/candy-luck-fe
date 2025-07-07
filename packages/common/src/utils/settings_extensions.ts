import { ISettingsSection } from '../settings/i_settings_section';
import { ISettingsStore } from '../settings/i_settings_store';
import { ISectionEditor } from '../settings/i_section_editor';

export class SettingsExtensions {
  static deleteKeyIfExist(settings: ISettingsSection, key: string): void {
    if (settings.keyExists(key)) {
      settings.deleteKey(key);
    }
  }

  static getOrAddSection(store: ISettingsStore, sectionName: string): ISettingsSection {
    if (!store.sectionExists(sectionName)) {
      return store.addSection(sectionName);
    }
    return store.getSection(sectionName);
  }

  static getSafe(section: ISettingsSection, key: string, def: any): any {
    try {
      if (section.keyExists(key)) {
        return section.get(key);
      }
    } catch {
      try {
        section.deleteKey(key);
      } catch {
        // ignore exceptions
      }
    }
    return def;
  }

  static getSafeFromEditor(self: ISectionEditor, key: string, def: any): any {
    let val: any;
    try {
      val = self.get(key);
    } catch {
      val = def;
    }
    return val;
  }
}
