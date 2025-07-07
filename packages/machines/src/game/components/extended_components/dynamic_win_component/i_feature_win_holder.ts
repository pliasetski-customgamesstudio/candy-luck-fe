import { IPostSpinUpdaterComponent } from '../i_post_spin_updater_component';

export interface IFeatureWinHolder extends IPostSpinUpdaterComponent {
  hasFeatureWin: boolean;
  getCurrentFeatureWin(): number;
  resetSavedWin(): void;
  addFeatureWinForCurrentSpin(win: number): void;
  reduceRemainingFeatureWin(win: number): void;
}
