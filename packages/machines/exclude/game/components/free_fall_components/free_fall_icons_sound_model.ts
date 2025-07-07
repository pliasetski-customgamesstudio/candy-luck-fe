import { SceneObject } from 'syd';
import { IconsSoundModel, SoundInstance } from 'machines/src/reels_engine_library';

class FreeFallIconsSoundModel extends IconsSoundModel {
  private _sounds: Map<number, SoundInstance> = new Map<number, SoundInstance>();

  constructor(soundsScene: SceneObject, maxIconId: number) {
    super(soundsScene, maxIconId);
    for (let iconIdx = 0; iconIdx <= maxIconId; ++iconIdx) {
      if (this.isNotEmpty(`icon_${iconIdx}`)) {
        this._sounds.set(iconIdx, this.getSoundByName(`icon_${iconIdx}`));
      }
    }

    for (let iconIdx = 0; iconIdx <= maxIconId; ++iconIdx) {
      if (this.isNotEmpty(`icon_collapse_${iconIdx}`)) {
        this._sounds.set(iconIdx, this.getSoundByName(`icon_collapse_${iconIdx}`));
      }
    }
  }

  getIconSound(iconIndex: number): SoundInstance {
    return this._sounds.get(iconIndex) !== undefined
      ? this._sounds.get(iconIndex)
      : SoundInstance.Empty;
  }

  hasSound(iconIndex: number): boolean {
    return this._sounds.get(iconIndex) !== undefined;
  }
}
