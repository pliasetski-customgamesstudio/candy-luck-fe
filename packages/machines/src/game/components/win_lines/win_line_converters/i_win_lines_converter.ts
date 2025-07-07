import { Line, ReelState } from '@cgs/common';

export interface IWinLinesConverter {
  getWinLines(reelState: ReelState): Line[];
}
