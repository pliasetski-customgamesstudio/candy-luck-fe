import { BuildAction } from '@cgs/shared';
import { IWinLinesAction } from './i_win_lines_action';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
} from '@cgs/syd';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { ICustomWinLinesSoundActionProvider } from '../../../../reels_engine/game_components_providers/i_custom_win_lines_sound_action_provider';
import { SoundConfigurationProvider } from '../../../common/sound_configuration_provider';
import { ISpinResponse, Line } from '@cgs/common';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { GameTimeAccelerationProvider } from '../../game_time_acceleration_provider';
import { AfterShortWinLinesActionProvider } from '../../after_short_win_lines_action_provider';
import { RegularSpinsSoundModelComponent } from '../../regular_spins_sound_model_component';
import {
  T_AfterShortWinLinesActionProvider,
  T_GameTimeAccelerationProvider,
  T_ICustomWinLinesSoundActionProvider,
  T_IGameStateMachineProvider,
  T_IWinLineActionProvider,
  T_RegularSpinsSoundModelComponent,
  T_SoundConfigurationProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IWinLineActionProvider } from '../i_win_line_action_provider';
import { WinLineActionProvider } from '../win_line_action_provider';

export class AllWinLinesAction extends BuildAction implements IWinLinesAction {
  public winLines: Line[];
  private _action: IntervalAction;
  private _reelsSoundModel: ReelsSoundModel;
  private _customWinLineSoundActionProvider: ICustomWinLinesSoundActionProvider | null;
  private _soundConfigProvider: SoundConfigurationProvider | null;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _fastSpinsController: GameTimeAccelerationProvider;
  private _animName: string;
  private _animatedPositions: number[];
  private _afterShortWinLinesActionProvider: AfterShortWinLinesActionProvider | null;

  constructor(container: Container, winLines: Line[], animName: string = 'anim') {
    super();
    this.winLines = winLines;
    this._animName = animName;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._customWinLineSoundActionProvider = container.resolve<ICustomWinLinesSoundActionProvider>(
      T_ICustomWinLinesSoundActionProvider
    );
    this._soundConfigProvider = container.resolve<SoundConfigurationProvider>(
      T_SoundConfigurationProvider
    );
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    this._animatedPositions = [];
    this._afterShortWinLinesActionProvider = container.resolve<AfterShortWinLinesActionProvider>(
      T_AfterShortWinLinesActionProvider
    );
    this._action = this.CreateAction(container, this.winLines);
    this.withDuration(this._action.duration);
  }

  buildAction(): IntervalAction {
    return this._action;
  }

  private CreateAction(container: Container, _winLines: Line[]): IntervalAction {
    if (!this.winLines.length && !this._customWinLineSoundActionProvider) {
      return new EmptyAction();
    }

    const resourceActions: IntervalAction[] = [];
    const stopAnimationActions: IntervalAction[] = [];
    const movieActions: IntervalAction[] = [];
    movieActions.push(new EmptyAction().withDuration(0.0));

    let animationDuration = 0.0;
    let regularSoundAction: IntervalAction | null = null;
    let wildSoundAction: IntervalAction | null = null;
    let stopSoundAction: IntervalAction | null = null;

    const afterShortWinLineAction =
      this._afterShortWinLinesActionProvider?.afterShortWinLinesAction ?? new EmptyAction();

    if (this.winLines.length) {
      const winLineActionProvider =
        container.forceResolve<IWinLineActionProvider>(T_IWinLineActionProvider);
      let highestSoundPriority = -1;

      const maxMultipliers = this.winLines.filter((l) => typeof l.multiplier === 'number');
      if (maxMultipliers.length !== 0) {
        resourceActions.push(
          new FunctionAction(() =>
            WinLineActionProvider.processMultiplier(
              container,
              Math.max(...maxMultipliers.map((l) => l.multiplier!))
            )
          )
        );
      }

      for (const line of this.winLines) {
        const newIcons: number[] = [];
        for (const iconIndex of line.iconsIndexes) {
          if (!this._animatedPositions.includes(iconIndex)) {
            this._animatedPositions.push(iconIndex);
            newIcons.push(iconIndex);
          }
        }
        const newLine: Line = {
          iconsIndexes: newIcons,
          lineIndex: line.lineIndex,
          multiplier: line.multiplier,
          symbolId: line.symbolId,
          winAmount: line.winAmount,
          winName: line.winName,
        };
        winLineActionProvider.createActions(newLine, this._animName);
        if (newIcons.length !== 0) {
          resourceActions.push(winLineActionProvider.winLineAnimationAction!);
          stopAnimationActions.push(winLineActionProvider.winLineStopAnimationAction!);
        }

        if (animationDuration < winLineActionProvider.animationDuration) {
          animationDuration = winLineActionProvider.animationDuration;
        }

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

        if (
          !regularSoundAction &&
          !wildSoundAction &&
          winLineActionProvider.winLineWildSoundAction
        ) {
          wildSoundAction = winLineActionProvider.winLineWildSoundAction;
          stopSoundAction = winLineActionProvider.winLineStopSoundAction;
        }

        if (
          winLineActionProvider.winMovieSceneAction &&
          winLineActionProvider.stopWinMovieSceneAction
        ) {
          movieActions.push(
            new SequenceAction([
              winLineActionProvider.winMovieSceneAction,
              winLineActionProvider.stopWinMovieSceneAction,
            ])
          );
        }
      }
      this._animatedPositions = [];
    }

    if (this._customWinLineSoundActionProvider) {
      this._customWinLineSoundActionProvider.updateActions(this.winLines);
      stopSoundAction = this._customWinLineSoundActionProvider.stopWinLinesSoundAction;
    }

    const winLineSoundAction: IntervalAction = this._customWinLineSoundActionProvider
      ? this._customWinLineSoundActionProvider.startWinLinesSoundAction!
      : regularSoundAction
        ? regularSoundAction
        : wildSoundAction!;

    if (winLineSoundAction) {
      resourceActions.push(winLineSoundAction);
    } else if (!this._soundConfigProvider || this._soundConfigProvider.playGeneralWinSound) {
      resourceActions.push(
        WinLineActionProvider.PlayWinSound(this._reelsSoundModel, this.winLines)
      );
    }

    if (!stopSoundAction) {
      stopSoundAction = new EmptyAction();
    }

    return new SequenceAction([
      new ParallelAction(resourceActions),
      new ParallelAction(stopAnimationActions),
      stopSoundAction,
      new SequenceAction(movieActions),
      afterShortWinLineAction,
    ]);
  }
}
