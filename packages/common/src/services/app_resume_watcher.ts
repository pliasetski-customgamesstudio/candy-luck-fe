import { IDisposable } from '@cgs/syd';

export interface IAppResumeWatcher {
  registerListener(listener: IAppResumeListener): void;
  unregisterListener(listener: IAppResumeListener): void;
}

export interface IAppResumeNotifier {
  fireAppResume(): Promise<void>;
}

export interface IAppResumeListener {
  onAppResume(): Promise<void>;
}

export class AppResumeWatcher implements IAppResumeWatcher, IAppResumeNotifier, IDisposable {
  private _listeners: IAppResumeListener[] = [];

  registerListener(listener: IAppResumeListener): void {
    if (this._listeners.includes(listener)) {
      return;
    }
    this._listeners.push(listener);
  }

  async fireAppResume(): Promise<void> {
    const listeners = this.getListeners();
    for (const listener of listeners) {
      await listener.onAppResume();
    }
  }

  private getListeners(): IAppResumeListener[] {
    const listeners: IAppResumeListener[] = [];
    listeners.push(...this._listeners);
    return listeners;
  }

  dispose(): void {
    this._listeners = [];
  }

  unregisterListener(listener: IAppResumeListener): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
}
