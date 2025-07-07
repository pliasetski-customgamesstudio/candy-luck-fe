import { IBalanceUpdaterRegistrator } from './interfaces/i_balance_updater_registrator';
import { CoinType, IBalanceUpdater } from './interfaces/i_balance_updater';
import { VoidFunc1 } from '@cgs/shared';
import { Vector2 } from '@cgs/syd';

export class BalanceUpdateService implements IBalanceUpdaterRegistrator, IBalanceUpdater {
  private _updaters: IBalanceUpdater[] = [];

  public execUpdate(
    mainUpdateFunc: VoidFunc1<IBalanceUpdater>,
    secondaryUpdateFunc: VoidFunc1<IBalanceUpdater> | null = null
  ): void {
    const balanceUpdaters = this._updaters;
    if (balanceUpdaters.length > 0) {
      mainUpdateFunc(balanceUpdaters[balanceUpdaters.length - 1]);
      for (let i = balanceUpdaters.length - 2; i >= 0; i--) {
        (secondaryUpdateFunc ?? mainUpdateFunc)(balanceUpdaters[i]);
      }
    }
  }

  public addBalanceToShown(sumToAdd: number): void {
    this.execUpdate((updater) => updater.addBalanceToShown(sumToAdd));
  }

  public decreaseBalanceAndStopUpdate(decreaseAmount: number): void {
    this.execUpdate(
      (updater) => updater.decreaseBalanceAndStopUpdate(decreaseAmount),
      (updater) => updater.decreaseBalanceAndStopUpdate(decreaseAmount)
    );
  }

  public updateBalance(): void {
    this.execUpdate((updater) => updater.updateBalance());
  }

  public isBalanceEnough(sum: number): boolean {
    for (const updater of this._updaters) {
      if (!updater.isBalanceEnough(sum)) {
        return false;
      }
    }
    return true;
  }

  public lockBalance(lockAmount: number): void {
    this.execUpdate((updater) => updater.lockBalance(lockAmount));
  }

  public register(updater: IBalanceUpdater): void {
    this._updaters.push(updater);
  }

  public resumeUpdate(animate: boolean = true): void {
    this.execUpdate(
      (updater) => updater.resumeUpdate(animate),
      (updater) => updater.resumeUpdate(false)
    );
  }

  public resumeUpdateWithCoin(startPosition: Vector2, coinType: CoinType = CoinType.Spiral): void {
    this.execUpdate(
      (updater) => updater.resumeUpdateWithCoin(startPosition, coinType),
      (updater) => updater.resumeUpdate(false)
    );
  }

  public resumeUpdateWithDisplayed(animate: boolean = true): void {
    this.execUpdate(
      (updater) => updater.resumeUpdateWithDisplayed(animate),
      (updater) => updater.resumeUpdate(false)
    );
  }

  public unlockBalance(): void {
    this.execUpdate((updater) => updater.unlockBalance());
  }

  public unregister(updater: IBalanceUpdater): void {
    this._updaters = this._updaters.filter((u) => u !== updater);
  }
}
