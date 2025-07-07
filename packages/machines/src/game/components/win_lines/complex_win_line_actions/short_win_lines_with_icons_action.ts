import { ShortWinLinesAction } from './short_win_lines_action';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { LinesSceneObject } from '../../../../reels_engine/lines_scene_object';
import { ICustomWinLinesSoundActionProvider } from '../../../../reels_engine/game_components_providers/i_custom_win_lines_sound_action_provider';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
} from '@cgs/syd';
import { LineModel } from '../../../../reels_engine/line_model';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { Line, ReelWinPosition } from '@cgs/common';
import {
  T_GameTimeAccelerationProvider,
  T_ICustomWinLinesSoundActionProvider,
  T_IGameStateMachineProvider,
} from '../../../../type_definitions';
import { IconsSoundModel } from '../../../../reels_engine/icons_sound_model';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameTimeAccelerationProvider } from '../../game_time_acceleration_provider';
import { AllWinLinesAction } from './all_win_lines_action';
import { ListUtil } from '@cgs/shared';

export class ShortWinLinesWithIconsAction extends ShortWinLinesAction {
  ReelSound: ReelsSoundModel;
  _customWinLineSoundActionProvider: ICustomWinLinesSoundActionProvider;
  _action: IntervalAction;

  constructor(
    container: Container,
    lineNode: LinesSceneObject,
    lineModel: LineModel,
    spinConfig: SpinConfig,
    winLines: Line[],
    winPositions: ReelWinPosition[],
    iconSoundModel: IconsSoundModel,
    reelsSoundModel: ReelsSoundModel
  ) {
    super(container, winLines, winPositions, lineNode, lineModel, spinConfig, reelsSoundModel);
    console.log('load ' + this.constructor.name);
    this._customWinLineSoundActionProvider = container.forceResolve(
      T_ICustomWinLinesSoundActionProvider
    );
    this._lineNode = lineNode;
    this.ReelSound = reelsSoundModel;
    this._action = this.CreateAction(container, winLines);
    this.withDuration(this._action.duration);
  }

  buildAction(): IntervalAction {
    return this._action;
  }

  CreateAction(container: Container, winLines: Line[]): IntervalAction {
    if (
      winLines.length === 0 &&
      this.winPositions.length === 0 &&
      !this._customWinLineSoundActionProvider
    ) {
      return new EmptyAction().withDuration(this.spinConfig.noWinDelay);
    }

    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );

    return fastSpinsController.isFastSpinsActive &&
      (gameStateMachine.isAutoSpins || gameStateMachine.curResponse.isFreeSpins)
      ? new SequenceAction([
          new ParallelAction([
            this.fastBlinkAllLines(),
            new AllWinLinesAction(
              container,
              ListUtil.union(
                winLines,
                this.winPositions.map((position) => {
                  const line = new Line();
                  line.iconsIndexes = position.positions;
                  line.symbolId = position.symbol;
                  return line;
                })
              )
            ),
            this.logoAnimationProvider
              ? this.logoAnimationProvider.getShortWinLineAction()
              : new EmptyAction(),
          ]),
          new FunctionAction(() => this._lineNode.clear()),
          new EmptyAction().withDuration(0.2),
        ])
      : new SequenceAction([
          new ParallelAction([
            this.blinkAllLines(),
            new AllWinLinesAction(
              container,
              ListUtil.union(
                winLines,
                this.winPositions.map((position) => {
                  const line = new Line();
                  line.iconsIndexes = position.positions;
                  line.symbolId = position.symbol;
                  return line;
                })
              )
            ),
            this.logoAnimationProvider
              ? this.logoAnimationProvider.getShortWinLineAction()
              : new EmptyAction(),
          ]),
          new FunctionAction(() => this._lineNode.clear()),
          new EmptyAction().withDuration(0.2),
        ]);
  }
}
