export interface ISplashManager {
  splashIsShown: boolean;

  step(): void;
  addSteps(steps: number): void;

  startShowingProgress(): void;
  setWelcomeBonusPreparing(freeSpinsBonus: number): void;
  setWelcomeBonusReady(coinsBonus: number, freeSpinsBonus: number): void;

  getWelcomeBonusPreparingTimerTask(): Promise<void>;
  getWelcomeBonusReadyTimerTask(): Promise<void>;
  getFinishedLoadingTask(): Promise<void>;
}

export class EmptyPreloader implements ISplashManager {
  splashIsShown: boolean = false;

  step(): void {}

  addSteps(_steps: number): void {}

  startShowingProgress(): void {}

  setWelcomeBonusPreparing(_freeSpinsBonus: number): void {}

  setWelcomeBonusReady(_coinsBonus: number, _freeSpinsBonus: number): void {}

  getWelcomeBonusPreparingTimerTask(): Promise<void> {
    return Promise.resolve();
  }

  getWelcomeBonusReadyTimerTask(): Promise<void> {
    return Promise.resolve();
  }

  getFinishedLoadingTask(): Promise<void> {
    return Promise.resolve();
  }
}
