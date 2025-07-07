import { Line } from '@cgs/common';
import { IntervalAction } from '@cgs/syd';

export interface IWinLineActionProvider {
  winLineAnimationAction: IntervalAction | null;
  winLineStopAnimationAction: IntervalAction | null;
  winLineRegularSoundAction: IntervalAction | null;
  winLineWildSoundAction: IntervalAction | null;
  winLineStopSoundAction: IntervalAction | null;
  winMovieSceneAction: IntervalAction | null;
  stopWinMovieSceneAction: IntervalAction | null;
  winLineSoundPriority: number;
  animationDuration: number;
  soundId: number;

  createActions(winLine: Line, animName?: string): void;
}
