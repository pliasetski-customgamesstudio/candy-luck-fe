import { IntervalAction, SequenceAction } from '@cgs/syd';
import { ShortWinLinesAction } from '../win_lines/complex_win_line_actions/short_win_lines_action';

export class ActionExtension {
  static ContainWinLines(animation: IntervalAction): boolean {
    let result = false;

    if (animation instanceof ShortWinLinesAction) {
      return this._containWinLines(animation);
    }
    if (animation instanceof SequenceAction) {
      const sequence = animation;

      if (sequence && sequence.childActions) {
        for (let i = 0; i < sequence.childActions.length; i++) {
          if (
            sequence.childActions[i] instanceof ShortWinLinesAction &&
            this._containWinLines(sequence.childActions[i] as ShortWinLinesAction)
          ) {
            return true;
          }
          if (sequence.childActions[i] instanceof SequenceAction) {
            return ActionExtension.ContainWinLines(sequence.childActions[i]);
          }
        }
      }
    }
    return result;
  }

  private static _containWinLines(winLineAction: ShortWinLinesAction): boolean {
    return (
      winLineAction &&
      ((winLineAction.winLines && winLineAction.winLines.length > 0) ||
        (winLineAction.winPositions && winLineAction.winPositions.length > 0))
    );
  }
}
