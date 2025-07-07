import { IWinLinesConverter } from './i_win_lines_converter';
import { Line, ReelState } from '@cgs/common';

export class PokerWinLinesConverter implements IWinLinesConverter {
  getWinLines(reelState: ReelState): Line[] {
    return reelState.additionalData.winLines || [];
  }
}
