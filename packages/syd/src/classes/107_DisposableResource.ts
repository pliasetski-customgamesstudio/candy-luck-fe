import { IDisposable } from './5_Disposable';
import { Resource } from './8_Resource';

export abstract class DisposableResource<T extends IDisposable> extends Resource<T> {
  protected constructor(id: string) {
    super(id);
  }

  destroy(): void {
    if (this.data) {
      this.data.dispose();
    }

    super.destroy();
  }
}
