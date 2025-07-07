export enum EpicWinStepName {
  BigWin = 'bigwin',
  MegaWin = 'megawin',
  EpicWin = 'epicwin',
  MaxWin = 'maxwin',
}

export class EpicWinStep {
  winName: EpicWinStepName;
  priority: number;
  animationDuration: number;
  startFromTotalBetCount: number;
  finishesWithTotalBetCount: number;

  constructor(
    priority: number,
    winName: EpicWinStepName,
    animationDuration: number,
    startFromTotalBetCount: number,
    finishesWithTotalBetCount: number
  ) {
    this.priority = priority;
    this.winName = winName;
    this.animationDuration = animationDuration;
    this.startFromTotalBetCount = startFromTotalBetCount;
    this.finishesWithTotalBetCount = finishesWithTotalBetCount;
  }
}
