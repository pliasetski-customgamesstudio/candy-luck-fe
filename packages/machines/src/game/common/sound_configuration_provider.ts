export class SoundConfigurationProvider {
  stopBackgroundSoundOnBonus: boolean;
  stopBackgroundSoundOnScatter: boolean;
  stopBackgroundSoundOnEndScatter: boolean;
  stopBackgroundSoundOnStartFreeSpins: boolean;
  stopBackgroundSoundOnAddFreeSpins: boolean;
  startFreeSpinsBackgroundOnEndFreeSpinsPopup: boolean;
  stopSpinBackgroundSoundDelay: number;
  playGeneralWinSound: boolean;

  constructor({
    stopBackgroundSoundOnBonus = false,
    stopBackgroundSoundOnScatter = false,
    stopBackgroundSoundOnStartFreeSpins = false,
    stopBackgroundSoundOnAddFreeSpins = false,
    stopBackgroundSoundOnEndScatter = false,
    startFreeSpinsBackgroundOnEndFreeSpinsPopup = false,
    stopSpinBackgroundSoundDelay = 0.0,
    playGeneralWinSound = true,
  }: {
    stopBackgroundSoundOnBonus?: boolean;
    stopBackgroundSoundOnScatter?: boolean;
    stopBackgroundSoundOnStartFreeSpins?: boolean;
    stopBackgroundSoundOnAddFreeSpins?: boolean;
    stopBackgroundSoundOnEndScatter?: boolean;
    startFreeSpinsBackgroundOnEndFreeSpinsPopup?: boolean;
    stopSpinBackgroundSoundDelay?: number;
    playGeneralWinSound?: boolean;
  }) {
    this.stopBackgroundSoundOnBonus = stopBackgroundSoundOnBonus;
    this.stopBackgroundSoundOnScatter = stopBackgroundSoundOnScatter;
    this.stopBackgroundSoundOnStartFreeSpins = stopBackgroundSoundOnStartFreeSpins;
    this.stopBackgroundSoundOnAddFreeSpins = stopBackgroundSoundOnAddFreeSpins;
    this.stopBackgroundSoundOnEndScatter = stopBackgroundSoundOnEndScatter;
    this.startFreeSpinsBackgroundOnEndFreeSpinsPopup = startFreeSpinsBackgroundOnEndFreeSpinsPopup;
    this.stopSpinBackgroundSoundDelay = stopSpinBackgroundSoundDelay;
    this.playGeneralWinSound = playGeneralWinSound;
  }
}
