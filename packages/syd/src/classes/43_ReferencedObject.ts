import { IDisposable } from './5_Disposable';

export abstract class ReferencedObject implements IDisposable {
  private _referencesCount: number = 1;

  addRef(): void {
    ++this._referencesCount;
  }

  removeRef(): void {
    if (this._referencesCount === 0) {
      console.error('References count is already 0');
      return;
    }

    --this._referencesCount;

    if (this._referencesCount === 0) {
      this.dispose();
    }
  }

  abstract dispose(): void;
}
