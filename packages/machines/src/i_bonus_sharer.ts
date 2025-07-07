export const T_IBonusSharer = Symbol('IBonusSharer');
export interface IBonusSharer {
  enabled: boolean;
  shareBonus(): void;
  shareEpicWin(): void;
  shareFreeSpins(gameId: string): Promise<boolean>;
}
