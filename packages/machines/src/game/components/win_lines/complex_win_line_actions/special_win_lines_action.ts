import { BuildAction } from '@cgs/shared';
import { IWinLinesAction } from './i_win_lines_action';
import { Line, ReelWinPosition } from '@cgs/common';
import { Container, EmptyAction, IntervalAction } from '@cgs/syd';
import { IconsSoundModel } from '../../../../reels_engine/icons_sound_model';
import { AllWinLinesAction } from './all_win_lines_action';

export class SpecialWinLinesAction extends BuildAction implements IWinLinesAction {
  private _winPositions: ReelWinPosition[];
  private _container: Container;
  private _iconsSoundModel: IconsSoundModel;
  private _winLines: Line[];

  constructor(
    container: Container,
    iconsSoundModel: IconsSoundModel,
    winLines: Line[],
    winPositions: ReelWinPosition[]
  ) {
    super();
    this._container = container;
    this._iconsSoundModel = iconsSoundModel;
    this._winLines = winLines;
    this._winPositions = winPositions;
  }

  public get winLines(): Line[] {
    return this._winLines;
  }

  buildAction(): IntervalAction {
    if (this._winLines.length === 0) {
      return new EmptyAction();
    }

    this._winLines = this._winPositions.map((item) => new Line(item.positions));
    return new AllWinLinesAction(this._container, this._winLines);
  }
}
