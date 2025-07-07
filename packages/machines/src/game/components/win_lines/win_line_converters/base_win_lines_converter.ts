import { IWinLinesConverter } from './i_win_lines_converter';
import { Line, ReelState } from '@cgs/common';

export class BaseWinLinesConverter implements IWinLinesConverter {
  getWinLines(reelsState: ReelState): Line[] {
    return reelsState.winLines || [];
  }
}
