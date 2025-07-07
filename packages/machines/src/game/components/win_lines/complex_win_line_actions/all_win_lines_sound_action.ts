import { BuildAction } from '@cgs/shared';
import { IWinLinesAction } from './i_win_lines_action';
import { Container, EmptyAction, IntervalAction, SequenceAction } from '@cgs/syd';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { Line } from '@cgs/common';
import { RegularSpinsSoundModelComponent } from '../../regular_spins_sound_model_component';
import {
  T_IWinLineActionProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../../../type_definitions';
import { IWinLineActionProvider } from '../i_win_line_action_provider';
import { WinLineActionProvider } from '../win_line_action_provider';

export class AllWinLinesSoundAction extends BuildAction implements IWinLinesAction {
  public winLines: Line[];
  private readonly _action: IntervalAction;
  private readonly _reelsSoundModel: ReelsSoundModel;

  constructor(container: Container, winLines: Line[]) {
    super();
    this.winLines = winLines;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;

    this._action = this.CreateAction(container, winLines);
    this.withDuration(this._action.duration);
  }

  public buildAction(): IntervalAction {
    return this._action;
  }

  private CreateAction(container: Container, winLines: Line[]): IntervalAction {
    if (!winLines.length) {
      return new EmptyAction();
    }

    let regularSoundAction: IntervalAction | null = null;
    let wildSoundAction: IntervalAction | null = null;
    let stopSoundAction: IntervalAction | null = null;

    const winLineActionProvider =
      container.forceResolve<IWinLineActionProvider>(T_IWinLineActionProvider);
    let highestSoundPriority = -1;
    for (const line of winLines) {
      winLineActionProvider.createActions(line);
      if (
        (!regularSoundAction || winLineActionProvider.winLineSoundPriority !== -1) &&
        winLineActionProvider.winLineRegularSoundAction
      ) {
        if (
          (winLineActionProvider.winLineSoundPriority < highestSoundPriority &&
            highestSoundPriority !== -1) ||
          (winLineActionProvider.winLineSoundPriority !== -1 && highestSoundPriority === -1)
        ) {
          highestSoundPriority = winLineActionProvider.winLineSoundPriority;
          regularSoundAction = winLineActionProvider.winLineRegularSoundAction;
          stopSoundAction = winLineActionProvider.winLineStopSoundAction;
        }

        if (highestSoundPriority === -1) {
          regularSoundAction = winLineActionProvider.winLineRegularSoundAction;
          stopSoundAction = winLineActionProvider.winLineStopSoundAction;
        }
      }

      if (!regularSoundAction && !wildSoundAction && winLineActionProvider.winLineWildSoundAction) {
        wildSoundAction = winLineActionProvider.winLineWildSoundAction;
        stopSoundAction = winLineActionProvider.winLineStopSoundAction;
      }
    }

    let winLineSoundAction = regularSoundAction || wildSoundAction;

    if (!winLineSoundAction) {
      winLineSoundAction = WinLineActionProvider.PlayWinSound(this._reelsSoundModel, winLines);
    }

    if (!stopSoundAction) {
      stopSoundAction = new EmptyAction();
    }

    return new SequenceAction([stopSoundAction, winLineSoundAction]);
  }
}
