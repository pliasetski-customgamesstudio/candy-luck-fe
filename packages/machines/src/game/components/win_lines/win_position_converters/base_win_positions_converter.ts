import { IWinPositionsConverter } from './i_win_positions_converter';
import { ReelState, ReelWinPosition } from '@cgs/common';

export class BaseWinPositionsConverter implements IWinPositionsConverter {
  private _simpleTypes: string[] = ['PayingSpecSymbol'];
  private _specialTypes: string[] = ['bonus', 'freespins', 'scatter', 'bonusWild', 'scatterWild'];

  getSimpleWinPositions(reelsState: ReelState): ReelWinPosition[] {
    return reelsState.winPositions
      ? reelsState.winPositions.filter((position) => this._simpleTypes.includes(position.type))
      : [];
  }

  getSpecialWinPositions(reelsState: ReelState): ReelWinPosition[] {
    return reelsState.winPositions
      ? reelsState.winPositions.filter((position) => this._specialTypes.includes(position.type))
      : [];
  }
}
