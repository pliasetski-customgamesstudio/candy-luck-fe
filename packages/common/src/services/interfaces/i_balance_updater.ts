import { Vector2 } from '@cgs/syd';

export enum CoinType {
  Spiral,
  Straight,
  Glow,
  BigGlow,
  LargeCoins,
}

export interface IBalanceUpdater {
  decreaseBalanceAndStopUpdate(decreaseAmount: number): void;
  updateBalance(): void;
  resumeUpdate(animate?: boolean): void;
  resumeUpdateWithCoin(startPosition: Vector2, coinType?: CoinType): void;
  addBalanceToShown(sumToAdd: number): void;
  isBalanceEnough(sum: number): boolean;
  resumeUpdateWithDisplayed(animate?: boolean): void;
  lockBalance(lockAmount: number): void;
  unlockBalance(): void;
}
