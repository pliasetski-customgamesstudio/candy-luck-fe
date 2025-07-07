import {
  ISlotsApiService,
  ISimpleUserInfoHolder,
  ISettingsManager,
  INavigationStack,
  ScaleManager,
  T_ISimpleUserInfoHolder,
  T_ISettingsManager,
  T_INavigationStack,
} from '@cgs/common';
import { IocContainer } from '@cgs/shared';
import { OverridingComponentProvider } from './game/base_slot_game';
import { IBalanceUpdater } from './game/components/balance_listener_provider';
import { GameOperation } from './game_operation';
import { IBonusSharer } from './i_bonus_sharer';
import { IGameNavigator } from './i_game_navigator';
import { ISomethingWentWrongShower } from './i_something_went_wrong_shower';
import { IUnlockMachinesHandler } from './i_unlock_machines_handler';

export class LobbyFacade {
  private _slotsApiService: ISlotsApiService;
  private _balanceUpdater: IBalanceUpdater;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _unlockMachinesHandler: IUnlockMachinesHandler;
  // private _triggerHandler: ITriggerHandler;
  private _bonusSharer: IBonusSharer;
  private _container: IocContainer;
  private _gameOperation: GameOperation;
  private _settingsManager: ISettingsManager;
  private _gameNavigator: IGameNavigator;
  private _navigationStack: INavigationStack;
  private _somethingWentWrongShower: ISomethingWentWrongShower;
  private _scaleManager: ScaleManager;

  constructor(
    gameOperation: GameOperation,
    slotsApiService: ISlotsApiService,
    balanceUpdater: IBalanceUpdater,
    unlockMachinesHandler: IUnlockMachinesHandler,
    gameNavigator: IGameNavigator,
    container: IocContainer,
    somethingWentWrongShower: ISomethingWentWrongShower,
    scaleManager: ScaleManager
  ) {
    this._gameOperation = gameOperation;
    this._slotsApiService = slotsApiService;
    this._balanceUpdater = balanceUpdater;
    this._unlockMachinesHandler = unlockMachinesHandler;
    this._gameNavigator = gameNavigator;
    this._container = container;
    this._somethingWentWrongShower = somethingWentWrongShower;
    this._scaleManager = scaleManager;

    // this._bonusSharer = this._container.forceResolve<IBonusSharer>(T_IBonusSharer);
    this._userInfoHolder = this._container.resolve(
      T_ISimpleUserInfoHolder
    ) as ISimpleUserInfoHolder;
    this._settingsManager = this._container.resolve(T_ISettingsManager) as ISettingsManager;
    this._navigationStack = this._container.resolve(T_INavigationStack) as INavigationStack;
  }

  get container(): IocContainer {
    return this._container;
  }

  resolve<T>(TService: symbol): T | null {
    return this._container.resolve<T>(TService);
  }

  get gameOperation() {
    return this._gameOperation;
  }

  get slotsApiService() {
    return this._slotsApiService;
  }

  get balanceUpdater() {
    return this._balanceUpdater;
  }

  get userInfoHolder() {
    return this._userInfoHolder;
  }

  get unlockMachinesHandler() {
    return this._unlockMachinesHandler;
  }

  // get panelHeight() {
  //   return this.panelHeight;
  // }

  get bonusSharer() {
    return this._bonusSharer;
  }

  get somethingWentWrongShower() {
    return this._somethingWentWrongShower;
  }

  get navigationStack() {
    return this._navigationStack;
  }

  get gameNavigator() {
    return this._gameNavigator;
  }

  get settingsManager() {
    return this._settingsManager;
  }

  get scaleManager() {
    return this._scaleManager;
  }

  getRequiredProviders(): symbol[] {
    const result: symbol[] = [];

    return result;
  }

  getReusableComponents(): OverridingComponentProvider[] {
    const result: OverridingComponentProvider[] = [];
    return result;
  }
}
