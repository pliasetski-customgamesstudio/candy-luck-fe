export interface IKeyValueStore {
  listKeys(): string[];
  keyExists(key: string): boolean;
  get(key: string): any;
  set(key: string, value: any): void;
  deleteKey(key: string): void;
}
