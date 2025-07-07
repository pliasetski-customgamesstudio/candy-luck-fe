import { BuildAction } from '@cgs/shared';
import { Line } from '@cgs/common';
import { Container, EmptyAction, IntervalAction, ParallelAction, SequenceAction } from '@cgs/syd';
import { IWinLineActionProvider } from './i_win_line_action_provider';
import { T_IWinLineActionProvider } from '../../../type_definitions';
import { ILogoAnimationProvider, T_LogoAnimationProvider } from '../i_logo_animation_provider';

export class WinLineAction extends BuildAction {
  winLine: Line;
  _action: IntervalAction;
  _useSound: boolean;

  constructor(container: Container, winLine: Line, useSound: boolean) {
    super();
    this.winLine = winLine;
    this._useSound = useSound;
    this._action = this.createAction(container, winLine);
    this.withDuration(this._action.duration);
  }

  buildAction(): IntervalAction {
    return this._action;
  }

  createAction(container: Container, winLine: Line): IntervalAction {
    if (!winLine) {
      return new EmptyAction();
    }

    const winLineActionProvider =
      container.forceResolve<IWinLineActionProvider>(T_IWinLineActionProvider);
    winLineActionProvider.createActions(winLine);

    const resourceActions: IntervalAction[] = [];
    resourceActions.push(winLineActionProvider.winLineAnimationAction!);

    if (this._useSound) {
      const winLineSoundAction = winLineActionProvider.winLineRegularSoundAction
        ? winLineActionProvider.winLineRegularSoundAction
        : winLineActionProvider.winLineWildSoundAction;

      if (winLineSoundAction) {
        resourceActions.push(winLineSoundAction);

        const logoAnimationProvider =
          container.resolve<ILogoAnimationProvider>(T_LogoAnimationProvider);
        if (logoAnimationProvider) {
          resourceActions.push(
            logoAnimationProvider.getLogoAnimationAction(winLineActionProvider.soundId)
          );
        }
      }
    }

    if (!winLineActionProvider.winLineStopSoundAction) {
      winLineActionProvider.winLineStopSoundAction = new EmptyAction();
    }

    let movieAction: IntervalAction = new EmptyAction().withDuration(0.0);
    if (
      winLineActionProvider.winMovieSceneAction &&
      winLineActionProvider.stopWinMovieSceneAction
    ) {
      movieAction = new SequenceAction([
        winLineActionProvider.winMovieSceneAction,
        winLineActionProvider.stopWinMovieSceneAction,
      ]);
    }

    return new SequenceAction([
      new ParallelAction(resourceActions),
      winLineActionProvider.winLineStopAnimationAction!,
      movieAction,
      winLineActionProvider.winLineStopSoundAction,
    ]);
  }
}
