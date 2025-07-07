import { SoundSceneObject, State } from '@cgs/syd';

export class SoundInstance {
  static readonly Empty: SoundInstance = SoundInstance.empty();
  private _sound: SoundSceneObject | null;
  private _stateMachine: State | null;

  constructor(sound: SoundSceneObject | null, stateMachine: State | null = null) {
    this._sound = sound;
    this._stateMachine = stateMachine;
  }

  private static empty(): SoundInstance {
    return new SoundInstance(null, null);
  }

  play(): void {
    if (this._sound) {
      this._sound.play();
    }
  }

  stop(): void {
    if (this._sound) {
      this._sound.stop();
    }
  }

  GoToState(state: string): void {
    if (this._stateMachine) {
      this._stateMachine.switchToState(state);
    }
  }
}
