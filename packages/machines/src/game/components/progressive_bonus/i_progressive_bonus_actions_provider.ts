import { Action } from '@cgs/syd';

export interface IProgressiveBonusActionsProvider {
  IconAnimationAction(position: number): Action;
  MovingSceneAction(position: number): Action;
  ProgressiveSceneAction(symbolId: number, symbolWin: number): Action;
  ResetAction(): Action;
  ProgressiveRecovery(step: number, currentWin: number, resetWhenCollectingComplete: boolean): void;
  hideMovingScene(): void;
  Reset(): void;
  enableFeature(enable: boolean): void;
  StopAllAnimations(featureMarker: string): void;
  readonly progressFinished: boolean;
  readonly currentStep: number;
}
