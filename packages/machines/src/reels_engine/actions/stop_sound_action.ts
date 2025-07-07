import { FunctionAction } from '@cgs/syd';
import { SoundInstance } from '../sound_instance';

export class StopSoundAction extends FunctionAction {
  constructor(sound: SoundInstance) {
    super(() => sound.stop());
  }
}
