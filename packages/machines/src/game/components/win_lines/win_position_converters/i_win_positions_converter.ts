import { ReelState, ReelWinPosition } from '@cgs/common';

export interface IWinPositionsConverter {
  getSpecialWinPositions(reelState: ReelState): ReelWinPosition[];
  getSimpleWinPositions(reelState: ReelState): ReelWinPosition[];
}
