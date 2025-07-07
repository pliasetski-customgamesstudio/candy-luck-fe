import { FunctionAction } from '@cgs/syd';
import { SoundInstance } from '../sound_instance';

export class PlaySoundAction extends FunctionAction {
  static withSound(sound: SoundInstance): PlaySoundAction {
    return new PlaySoundAction(() => sound.play());
  }

  constructor(playAction: () => void) {
    super(playAction);
  }
}
