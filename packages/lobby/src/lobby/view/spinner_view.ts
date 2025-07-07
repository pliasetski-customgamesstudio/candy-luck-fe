import { IDisposable, SceneObject } from '@cgs/syd';

export class SpinnerView extends SceneObject {
  private _toDispose: IDisposable[] = [];

  constructor(_root: SceneObject) {
    super();
  }

  addOwnerhip(obj: IDisposable): void {
    if (!this._toDispose.includes(obj)) {
      this._toDispose.push(obj);
    }
  }

  dispose(): void {
    for (const disposable of this._toDispose) {
      disposable.dispose();
    }
    this._toDispose = [];
  }
}
