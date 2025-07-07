export interface IStorageRepositoryProvider {
  createItem(key: string, value: string, isUpdateMode?: boolean): void;
  readItem(key: string): string | null;
  deleteItem(key: string): void;
}
