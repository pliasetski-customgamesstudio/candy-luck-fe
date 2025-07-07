import { Line } from '@cgs/common';
import {
  Action,
  EmptyAction,
  IntervalAction,
  ParallelAction,
  RepeatAction,
  SequenceAction,
} from '@cgs/syd';
import { SlotSession } from '../../../common/slot_session';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider } from '../../../../type_definitions';
import { WinLineAction } from '../win_line_action';
import { ExpandedShortWinlinesActions } from './expanded_short_winlines_action';
import { IExpandedWinlineOptions } from './i_win_lines_action';

export class ExpandedWinlinesActions extends ExpandedShortWinlinesActions {
  private readonly _useSound: boolean;
  private readonly _slotSession: SlotSession;

  constructor(options: IExpandedWinlineOptions, useSound: boolean) {
    super(options);

    this._slotSession =
      this.container.resolve<ISlotSessionProvider>(T_ISlotSessionProvider)!.slotSession;

    this._useSound = useSound;
  }

  //-------- PUBLIC -------
  public buildAction(): Action {
    const winlines = this._getSortedWinlinesByWinAmount();
    if (!winlines.length) {
      return new EmptyAction();
    }

    const result = winlines.map((line) => this._processWinline(line));
    return new RepeatAction(new SequenceAction(result));
  }

  //------- PRIVATE -------
  private _getSortedWinlinesByWinAmount(): Line[] {
    const winLines = super.winLines.slice();
    for (const winLine of winLines) {
      // TODO: multiplier может быть равен null?
      winLine.winAmount = Math.floor(
        winLine.winAmount * winLine.multiplier! * this._slotSession.currentBet.bet
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

  private _processWinline(winline: Line): IntervalAction {
    const delay = new EmptyAction().withDuration(0.2);

    return new SequenceAction([
      new ParallelAction([
        new WinLineAction(this.container, winline, this._useSound),
        this.lineDrawer?.drawWinlineAction(winline.lineIndex) || new EmptyAction(),
      ]),
      this.lineDrawer?.hideWinlinesAction() || new EmptyAction(),
      delay,
    ]);
  }
}
