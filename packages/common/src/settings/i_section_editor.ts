import { IKeyValueStore } from './i_key_value_store';
import { IDisposable } from '@cgs/syd';

export interface ISectionEditor extends IKeyValueStore, IDisposable {}
