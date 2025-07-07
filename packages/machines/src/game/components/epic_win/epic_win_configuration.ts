import { EpicWinStep } from './epic_win_step';

export class EpicWinConfiguration {
  steps: EpicWinStep[];
  showCounterDelay: number;
  incrementDurationCorrection: number;
  finishTextAnimationDelay: number;
  closePopupDelay: number;

  constructor(
    steps: EpicWinStep[],
    showCounterDelay: number,
    incrementDurationCorrection: number,
    finishTextAnimationDelay: number,
    closePopupDelay: number
  ) {
    this.steps = steps;
    this.showCounterDelay = showCounterDelay;
    this.incrementDurationCorrection = incrementDurationCorrection;
    this.finishTextAnimationDelay = finishTextAnimationDelay;
    this.closePopupDelay = closePopupDelay;
  }
}
