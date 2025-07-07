import { ShortNWaysLinesAction } from './short_nways_lines_action';
import { Line, ReelWinPosition } from '@cgs/common';
import { Container, EmptyAction, IntervalAction, SceneObject } from '@cgs/syd';
import { ICustomWinLinesSoundActionProvider } from '../../../../reels_engine/game_components_providers/i_custom_win_lines_sound_action_provider';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { T_ICustomWinLinesSoundActionProvider } from '../../../../type_definitions';
import { AllWinLinesAction } from './all_win_lines_action';

export class SpecialNWaysAction extends ShortNWaysLinesAction {
  private readonly _customWinLineSoundActionProvider: ICustomWinLinesSoundActionProvider | null;

  constructor(
    container: Container,
    winLines: Line[],
    fadeSceneObject: SceneObject,
    spinConfig: SpinConfig,
    winPositions: ReelWinPosition[],
    animName: string = 'anim'
  ) {
    super(container, winLines, winPositions, spinConfig, fadeSceneObject, animName);
    this._winPositions = winPositions;
    this._customWinLineSoundActionProvider = container.resolve<ICustomWinLinesSoundActionProvider>(
      T_ICustomWinLinesSoundActionProvider
    );
    this._action = this.createAction(container, winLines);
    this.withDuration(this._action.duration);
  }

  buildAction(): IntervalAction {
    return this._action;
  }

  createAction(container: Container, winLines: Line[]): IntervalAction {
    if (this._winPositions?.length > 0 || this._customWinLineSoundActionProvider) {
      winLines = this._winPositions.map((e) => {
        const line = new Line();
        line.iconsIndexes = e.positions;
        line.symbolId = e.symbol;
        return line;
      });

      return new AllWinLinesAction(container, winLines, this.animName);
    }

    return new EmptyAction();
  }
}
