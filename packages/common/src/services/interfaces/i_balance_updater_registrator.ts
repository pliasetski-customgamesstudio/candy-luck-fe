import { IBalanceUpdater } from './i_balance_updater';

export interface IBalanceUpdaterRegistrator {
  register(updater: IBalanceUpdater): void;
  unregister(updater: IBalanceUpdater): void;
}
