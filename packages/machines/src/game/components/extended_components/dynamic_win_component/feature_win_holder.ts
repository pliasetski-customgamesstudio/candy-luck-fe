import { IBalanceUpdater, ISpinResponse } from '@cgs/common';
import { IFeatureWinHolder } from './i_feature_win_holder';

export class FeatureWinHolder implements IFeatureWinHolder {
  private _specGroups: Map<string, string>;
  private _balanceUpdater: IBalanceUpdater;

  private _currentIngoredWin: number = 0.0;

  constructor(specGroups: Map<string, string>, balanceUpdater: IBalanceUpdater) {
    this._specGroups = specGroups;
    this._balanceUpdater = balanceUpdater;
  }

  get hasFeatureWin(): boolean {
    return this._currentIngoredWin > 0.0;
  }

  getCurrentFeatureWin(): number {
    return this._currentIngoredWin;
  }

  resetSavedWin(): void {
    this._currentIngoredWin = 0.0;
    this._balanceUpdater.unlockBalance();
  }

  addFeatureWinForCurrentSpin(win: number): void {
    this._currentIngoredWin += win;
    this._balanceUpdater.lockBalance(this._currentIngoredWin);
  }

  reduceRemainingFeatureWin(win: number): void {
    this._currentIngoredWin -= win;
    if (this._currentIngoredWin < 0.0) {
      this._currentIngoredWin = 0.0;
      this._balanceUpdater.unlockBalance();
      return;
    }

    this._balanceUpdater.lockBalance(this._currentIngoredWin);
  }

  processResponse(spinResponse: ISpinResponse): void {
    if (!this._specGroups || !spinResponse || !spinResponse.specialSymbolGroups) return;
    this.resetSavedWin();
    for (const group of spinResponse.specialSymbolGroups) {
      if (!group.type) {
        continue;
      }
      if (this._specGroups.has(group.type) && typeof group.totalJackPotWin === 'number') {
        const subTypes = this._specGroups.get(group.type) ?? null;
        if (!subTypes) {
          this._currentIngoredWin += group.totalJackPotWin ?? 0.0;
        } else if (subTypes.includes(group.subType!)) {
          this._currentIngoredWin += group.totalJackPotWin ?? 0.0;
        }
      }
    }
    this._balanceUpdater.lockBalance(this._currentIngoredWin);
  }
}
