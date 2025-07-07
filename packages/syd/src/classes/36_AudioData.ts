import { IDisposable } from './5_Disposable';

export abstract class AudioData implements IDisposable {
  abstract dispose(): void;
}
