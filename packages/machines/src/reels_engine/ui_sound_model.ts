import { SceneObject } from '@cgs/syd';
import { AbstractSoundModel } from './reels_sound_model';
import { SoundInstance } from './sound_instance';

export class UiSoundModel extends AbstractSoundModel {
  paytableClick: SoundInstance;
  featureSound: SoundInstance;

  constructor(soundsScene: SceneObject, featureSoundName: string) {
    super(soundsScene);
    this.paytableClick = this.getSoundByName('Paytable_backtogame');
    this.featureSound = this.getSoundByName(featureSoundName);
  }
}
