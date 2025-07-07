import { SoundState } from '@cgs/syd';

export enum SlotSoundType {
  Background,
}

export class SlotSoundConfigEntry {
  soundState: SoundState;
  soundType: SlotSoundType;
  trigger: string;

  constructor(soundType: SlotSoundType, soundState: SoundState, trigger: string) {
    this.soundType = soundType;
    this.soundState = soundState;
    this.trigger = trigger;
  }
}
