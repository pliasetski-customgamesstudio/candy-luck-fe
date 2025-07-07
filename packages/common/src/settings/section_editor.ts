import { ISectionEditor } from './i_section_editor';
import { Cookies } from '@cgs/shared';

export class SectionEditor implements ISectionEditor {
  private _name: string;
  private _settingsDict: Record<string, any>;

  constructor(name: string) {
    this._name = name;
    this._settingsDict = Cookies.getJson(name) ?? {};
  }

  deleteKey(key: string): void {
    this._settingsDict.delete(key);
  }

  dispose(): void {
    Cookies.setJson(this._name, this._settingsDict);
  }

  get(key: string): any {
    return this._settingsDict.get(key);
  }

  keyExists(key: string): boolean {
    return this._settingsDict.has(key);
  }

  listKeys(): string[] {
    return Array.from(this._settingsDict.keys());
  }

  set(key: string, value: any): void {
    this._settingsDict.set(key, value);
  }
}
