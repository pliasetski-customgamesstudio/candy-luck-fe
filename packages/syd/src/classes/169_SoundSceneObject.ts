import { Sound } from './187_Sound';
import { SoundState } from './207_SoundFactory';
import { SceneObject } from './288_SceneObject';
import { SceneObjectType } from './SceneObjectType';

export class SoundSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Sound;
  }
  private _sound: Sound;

  get volume(): number {
    return this._sound.volume;
  }

  set volume(value: number) {
    this._sound.volume = value;
  }

  set loop(value: boolean) {
    this._sound.loop = value;
  }

  constructor(sound: Sound) {
    super();
    this._sound = sound;
  }

  play(): void {
    this._sound.play();
  }

  stop(): void {
    this._sound.stop();
  }

  initializeImpl(): void {
    this._sound.create();
  }

  deinitializeImpl(): void {
    this._sound.destroy();
  }

  activeChanged(active: boolean): void {
    super.activeChanged(active);
    if (!active && this._sound.state === SoundState.Playing) {
      this._sound.pause();
    }

    if (active && this._sound.state === SoundState.Paused) {
      this._sound.resume();
    }
  }
}
