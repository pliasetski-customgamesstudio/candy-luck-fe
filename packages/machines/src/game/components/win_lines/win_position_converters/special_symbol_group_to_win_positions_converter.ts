import { IWinPositionsConverter } from './i_win_positions_converter';
import { ReelState, ReelWinPosition } from '@cgs/common';

export class SpecialSymbolGroupToWinPositionsConverter implements IWinPositionsConverter {
  private readonly _simpleTypes: string[] = ['PayingSpecSymbol'];
  private readonly _specialTypes: string[] = [
    'bonus',
    'freespins',
    'scatter',
    'bonusWild',
    'scatterWild',
  ];
  private readonly _marker: string | null;

  constructor(marker: string | null = null) {
    this._marker = marker;
  }

  getSpecialWinPositions(reelState: ReelState): ReelWinPosition[] {
    const winPositions: ReelWinPosition[] = [];
    if (reelState && reelState.specialSymbolGroups && reelState.specialSymbolGroups.length > 0) {
      let symbolGroups = reelState.specialSymbolGroups;
      if (this._marker) {
        symbolGroups = reelState.specialSymbolGroups.filter((p) => p.type === this._marker);
      }

      for (const specialSymbolGroup of symbolGroups) {
        winPositions.push(
          new ReelWinPosition(
            specialSymbolGroup.positions || [],
            specialSymbolGroup.type || '',
            specialSymbolGroup.symbolId,
            specialSymbolGroup.totalJackPotWin
          )
        );
      }
    }

    return winPositions.length > 0
      ? winPositions
      : reelState.winPositions
        ? reelState.winPositions.filter((position) => this._specialTypes.includes(position.type))
        : [];
  }

  getSimpleWinPositions(reelState: ReelState): ReelWinPosition[] {
    return reelState.winPositions
      ? reelState.winPositions.filter((position) => this._simpleTypes.includes(position.type))
      : [];
  }
}
