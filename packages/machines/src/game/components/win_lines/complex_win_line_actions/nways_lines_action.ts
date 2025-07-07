import { ShortNWaysLinesAction } from './short_nways_lines_action';
import {
  Container,
  EmptyAction,
  IntervalAction,
  RepeatAction,
  SceneObject,
  SequenceAction,
} from '@cgs/syd';
import { Line, ReelWinPosition } from '@cgs/common';
import { AbstractSpinConfig } from '../../../../reels_engine/game_config/abstract_spin_config';
import { WinLineAction } from '../win_line_action';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';

export class NWaysLinesAction extends ShortNWaysLinesAction {
  private readonly _useSound: boolean;

  constructor(
    container: Container,
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinConfig: AbstractSpinConfig,
    fadeSceneObject: SceneObject,
    useSound: boolean
  ) {
    super(container, winLines, winPositions, spinConfig as SpinConfig, fadeSceneObject);
    this._container = container;
    this._useSound = useSound;
  }

  buildAction(): IntervalAction {
    const winLines = this.getSortedWinLinesWithWinPositions();
    if (!winLines || winLines.length === 0) {
      return new EmptyAction();
    }
    const res = winLines.map((line) => this.processWinLine(line));
    return new RepeatAction(new SequenceAction(res));
  }

  getSortedWinLinesWithWinPositions(): Line[] {
    const winLines = super.winLines.slice();
    for (const winLine of winLines) {
      // TODO: multiplier может быть равен null?
      winLine.winAmount = Math.floor(
        winLine.winAmount * winLine.multiplier! * this.slotSession.currentBet.bet
      );
    }
    if (this.winPositions) {
      for (const winPos of this.winPositions) {
        const newWinLine = new Line();
        newWinLine.iconsIndexes = winPos.positions;
        newWinLine.symbolId = winPos.symbol;
        newWinLine.winAmount = Math.floor(winPos.win);
        winLines.push(newWinLine);
      }
    }
    winLines.sort((a, b) => {
      const win = b.winAmount - a.winAmount;
      if (win === 0) {
        // TODO: symbolId может быть равен null?
        if (a.symbolId! - b.symbolId! === 0) {
          if (typeof a.lineIndex === 'number' && typeof b.lineIndex === 'number') {
            return a.lineIndex - b.lineIndex;
          }
        }
        // TODO: symbolId может быть равен null?
        return a.symbolId! - b.symbolId!;
      }
      return win;
    });
    return winLines;
  }

  processWinLine(winline: Line): IntervalAction {
    const delayAction = new EmptyAction();
    delayAction.withDuration(0.2);

    return new SequenceAction([
      new WinLineAction(this._container, winline, this._useSound),
      delayAction,
    ]);
  }
}
