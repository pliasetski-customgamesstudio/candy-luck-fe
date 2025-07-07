import { ISectionEditor } from './i_section_editor';
import { IKeyValueStore } from './i_key_value_store';

export interface ISettingsSection extends IKeyValueStore {
  name: string;
  getEditor(): ISectionEditor;
}
