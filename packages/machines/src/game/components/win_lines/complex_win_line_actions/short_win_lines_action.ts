import { Line, ReelWinPosition } from '@cgs/common';
import { BuildAction } from '@cgs/shared';
import {
  Container,
  IntervalAction,
  EmptyAction,
  SequenceAction,
  ParallelAction,
  FunctionAction,
} from '@cgs/syd';
import { WinLineActionProvider } from '../win_line_action_provider';
import { AllWinLinesAction } from './all_win_lines_action';
import { IWinLinesAction } from './i_win_lines_action';
import { LineBlinkAction } from './line_blink_action';
import { LinesSceneObject } from '../../../../reels_engine/lines_scene_object';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { LineModel, RegularLineIndex } from '../../../../reels_engine/line_model';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { ILogoAnimationProvider } from '../../i_logo_animation_provider';
import {
  T_GameTimeAccelerationProvider,
  T_IGameStateMachineProvider,
  T_ILogoAnimationProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameTimeAccelerationProvider } from '../../game_time_acceleration_provider';

export class ShortWinLinesAction extends BuildAction implements IWinLinesAction {
  public winLines: Line[];
  protected _lineNode: LinesSceneObject;
  private _container: Container;
  private readonly _reelsSoundModel: ReelsSoundModel;
  private readonly _lineModel: LineModel;
  private readonly _spinConfig: SpinConfig;
  private readonly _logoAnimationProvider: ILogoAnimationProvider | null;
  private readonly _winPositions: ReelWinPosition[];

  constructor(
    container: Container,
    winLines: Line[],
    winPositions: ReelWinPosition[],
    lineNode: LinesSceneObject,
    lineModel: LineModel,
    spinConfig: SpinConfig,
    reelsSoundModel: ReelsSoundModel
  ) {
    super();
    this._container = container;
    this.winLines = winLines;
    this._winPositions = winPositions;
    this._lineNode = lineNode;
    this._lineModel = lineModel;
    this._spinConfig = spinConfig;
    this._reelsSoundModel = reelsSoundModel;
    this._logoAnimationProvider =
      this._container.resolve<ILogoAnimationProvider>(T_ILogoAnimationProvider);
  }

  get container(): Container {
    return this._container;
  }
  set container(value: Container) {
    this._container = value;
  }

  get lineNode(): LinesSceneObject {
    return this._lineNode;
  }

  get lineModel(): LineModel {
    return this._lineModel;
  }

  get spinConfig(): SpinConfig {
    return this._spinConfig;
  }

  get logoAnimationProvider(): ILogoAnimationProvider | null {
    return this._logoAnimationProvider;
  }

  get winPositions(): ReelWinPosition[] {
    return this._winPositions;
  }

  buildAction(): IntervalAction {
    if (this.winLines.length === 0 && this._winPositions.length === 0) {
      return new EmptyAction().withDuration(this._spinConfig.noWinDelay);
    }
    const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const fastSpinsController = this._container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    return fastSpinsController.isFastSpinsActive &&
      (gameStateMachine.isAutoSpins || gameStateMachine.curResponse.isFreeSpins)
      ? new SequenceAction([
          new ParallelAction([
            WinLineActionProvider.PlayWinSound(this._reelsSoundModel, this.winLines),
            this._logoAnimationProvider
              ? this._logoAnimationProvider.getShortWinLineAction()
              : new EmptyAction(),
          ]),
          this.fastBlinkAllLines(),
        ])
      : new SequenceAction([
          new ParallelAction([
            WinLineActionProvider.PlayWinSound(this._reelsSoundModel, this.winLines),
            this._logoAnimationProvider
              ? this._logoAnimationProvider.getShortWinLineAction()
              : new EmptyAction(),
          ]),
          this.blinkAllLines(),
        ]);
  }

  protected blinkAllLines(): IntervalAction {
    const res: IntervalAction[] = [
      new FunctionAction(() => {
        const l = this.winLines.map((line) =>
          this._lineModel.getLine(new RegularLineIndex(line.lineIndex))
        );
        l.forEach((e) => this._lineNode.add(e!));
      }),
      new LineBlinkAction(this._lineNode, this._spinConfig),
    ];

    return new SequenceAction(res);
  }

  protected fastBlinkAllLines(): IntervalAction {
    const res: IntervalAction[] = [
      new FunctionAction(() => {
        const l = this.winLines.map((line) =>
          this._lineModel.getLine(new RegularLineIndex(line.lineIndex))
        );
        l.forEach((e) => this._lineNode.add(e!));
      }),
      new LineBlinkAction(this._lineNode, this._spinConfig, 0.1, 3),
    ];

    return new SequenceAction(res);
  }

  WinPositionsAction(): IntervalAction {
    const winLines = this._winPositions.map((position) => {
      const line = new Line();
      line.iconsIndexes = position.positions;
      line.symbolId = position.symbol;
      return line;
    });
    return new AllWinLinesAction(this._container, winLines);
  }
}
