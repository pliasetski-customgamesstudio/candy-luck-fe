import { SceneObject } from '@cgs/syd';
import { AbstractSoundModel } from './reels_sound_model';
import { SoundInstance } from './sound_instance';

export class IconsSoundModel extends AbstractSoundModel {
  private _sounds: Map<number, SoundInstance> = new Map<number, SoundInstance>();
  private _maxIconId: number;
  get maxIconId(): number {
    return this._maxIconId;
  }

  get isFreeFallIconsSoundModel(): boolean {
    return false;
  }

  constructor(soundsScene: SceneObject, maxIconId: number) {
    super(soundsScene);
    this._maxIconId = maxIconId;
    for (let iconIdx = 0; iconIdx <= this._maxIconId; ++iconIdx) {
      if (this.isNotEmpty(`icon_${iconIdx}`)) {
        this._sounds.set(iconIdx, this.getSoundByName(`icon_${iconIdx}`));
      }
    }

    for (let iconIdx = 0; iconIdx <= this._maxIconId; ++iconIdx) {
      const longIconIdx = iconIdx * 100;
      if (this.isNotEmpty(`icon_${longIconIdx}`)) {
        this._sounds.set(longIconIdx, this.getSoundByName(`icon_${longIconIdx}`));
      }
    }
  }

  getIconSound(iconIndex: number): SoundInstance {
    return this._sounds.has(iconIndex) ? this._sounds.get(iconIndex)! : SoundInstance.Empty;
  }

  getIconSoundNodes(iconIndex: number): SceneObject[] {
    return this.soundsScene.findAllById(`icon_${iconIndex}`) as SceneObject[];
  }

  hasSound(iconIndex: number): boolean {
    return this._sounds.has(iconIndex);
  }
}
