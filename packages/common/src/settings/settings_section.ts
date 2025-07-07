import { ISettingsSection } from './i_settings_section';
import { ISectionEditor } from './i_section_editor';
import { SectionEditor } from './section_editor';
import { Cookies } from '@cgs/shared';

export class SettingsSection implements ISettingsSection {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  getEditor(): ISectionEditor {
    return new SectionEditor(this._name);
  }

  deleteKey(key: string): void {
    const json = Cookies.getJson(this._name);
    if (json) {
      delete json[key];
      Cookies.setJson(this._name, json);
    }
  }

  get(key: string): any {
    const json = Cookies.getJson(this._name);
    return json ? json[key] : null;
  }

  keyExists(key: string): boolean {
    const json = Cookies.getJson(this._name);
    return json ? json[key] !== undefined : false;
  }

  listKeys(): string[] {
    const json = Cookies.getJson(this._name);
    return json ? Object.keys(json).map((k) => k.toString()) : [];
  }

  get name(): string {
    return this._name;
  }

  set(key: string, value: any): void {
    let json = Cookies.getJson(this._name);
    if (!json) {
      json = {};
    }

    json[key] = value;
    Cookies.setJson(this._name, json);
  }
}
