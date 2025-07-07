import {
  ISimpleUserInfoHolder,
  IClientProperties,
  InternalBet,
  XtremeBetInfo,
  ISlotMachineInfo,
  T_GameOperation,
  BetCalculationType,
  ISpinResponse,
  T_ISimpleUserInfoHolder,
  T_IClientProperties,
  T_IBalanceUpdater,
  InternalFreeSpinsGroup,
} from '@cgs/common';
import { CollectionEx } from '@cgs/shared';
import {
  View,
  Container,
  EventDispatcher,
  EPSILON,
  EventStream,
  IDisposable,
  EventStreamSubscription,
} from '@cgs/syd';
import { IBalanceUpdater } from '../components/balance_listener_provider';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../components/game_state_machine_notifier_component';
import { NotEnoughBalanceController } from '../components/not_enough_balance_controller';
import { NotEnoughBalanceProvider } from '../components/not_enough_balance_provider';
import { SlotBetStorageProvider } from '../components/slot_bet_storage_provider';
import { SpecialChangeBetComponent } from '../components/special_change_bet_component';
import { GameOperation } from '../../game_operation';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_ISlotPopupCoordinator,
  T_GameStateMachineNotifierComponent,
  T_NotEnoughBalanceProvider,
  T_SpecialChangeBetComponent,
  T_SlotBetStorageProvider,
  T_ISlotPrimaryAnimationProvider,
} from '../../type_definitions';
import { SlotPopups } from './slot/views/base_popup_view';
import { ISlotPopupCoordinator } from './slot_popup_coordinator';
import { Key } from 'ts-keycode-enum';
import { BonusResult } from '@cgs/features';
import { ISlotPrimaryAnimationProvider } from '../components/interfaces/i_slot_primary_animation_provider';

export enum SlotSessionProperties {
  Balance = 'Balance',
  TotalWin = 'TotalWin',
  AddTotalWin = 'AddTotalWin',
  AddCurrentWin = 'AddCurrentWin',
  ResetWinState = 'ResetWinState',
  Lines = 'Lines',
  Bet = 'Bet',
  BetMultiplier = 'BetMultiplier',
  TotalBet = 'TotalBet',
  Bets = 'Bets',
  BetIndex = 'BetIndex',
  SpecialBetIndex = 'SpecialBetIndex',
  UserChangedBet = 'UserChangedBet',
  NewBetAvailable = 'NewBetAvailable',
  UpdateMaxBet = 'UpdateMaxBet',
  UserMaxBet = 'UserMaxBet',
  NewConfiguredBetsAvailable = 'NewConfiguredBetsAvailable',
  XtremeBetEnabled = 'XtremeBetEnabled',
}

export class SlotSession implements AbstractListener, IDisposable {
  BetType: string = 'custom';

  private _gameView: View;
  private _container: Container;
  private _gameStateMachine: GameStateMachine<any>;
  private _keysSub: EventStreamSubscription<Key>;
  // private _betUpdater: IBetUpdaterProvider;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _balanceUpdater: IBalanceUpdater;
  private _gameOperation: GameOperation;
  private _slotPopupCoordinator: ISlotPopupCoordinator;
  private _slotBetStorageProvider: SlotBetStorageProvider;
  private _clientProperties: IClientProperties;
  private _specialChangeBetComponent: SpecialChangeBetComponent | null;
  protected _notEnoughBalanceController: NotEnoughBalanceController;

  private _balance: number;
  private _totalWin: number;
  private _currentWin: number;
  private _lines: number;
  private _bet: InternalBet | null = null;
  private _totalBet: number = 0.0;
  private _currentBetMultiplier: number = 0;
  private _currentBetIndex: number;
  private _currentVolatility: number;
  private _gameId: string;
  private _propertyChangedController: EventDispatcher<SlotSessionProperties> =
    new EventDispatcher<SlotSessionProperties>();
  public machineInfo: ISlotMachineInfo;

  private _xtremeBetInfo: XtremeBetInfo;
  private _isXtremeBetEnable: boolean = false;
  get defaultBet(): number {
    return this.Bets[0].bet;
  }

  constructor(container: Container, machineInfo: ISlotMachineInfo, gameView: View, gameId: string) {
    this._container = container;
    this.machineInfo = machineInfo;
    this._gameView = gameView;
    this._gameId = gameId;
  }
  OnStateEntered(_slotState: string): void {}
  OnStateExited(_slotState: string): void {}

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  get userInfoHolder(): ISimpleUserInfoHolder {
    return this._userInfoHolder;
  }

  get notEnoughBalanceController(): NotEnoughBalanceController {
    if (!this._notEnoughBalanceController) {
      this._notEnoughBalanceController = this._container.forceResolve<NotEnoughBalanceProvider>(
        T_NotEnoughBalanceProvider
      ).popupController as NotEnoughBalanceController;
    }
    return this._notEnoughBalanceController;
  }

  get totalWin(): number {
    return this._totalWin;
  }

  get currentWin(): number {
    return this._currentWin;
  }

  get lines(): number {
    return this._lines;
  }

  get bet(): InternalBet {
    return this._bet as InternalBet;
  }

  get totalBet(): number {
    return this._totalBet;
  }

  get currentBetMultiplier(): number {
    return this._currentBetMultiplier;
  }

  get currentVolatility(): number {
    return this._currentVolatility;
  }

  get GameId(): string {
    return this._gameId;
  }

  get GameIdNew(): string {
    return '421';
  }

  get propertyChanged(): EventStream<SlotSessionProperties> {
    return this._propertyChangedController.eventStream;
  }

  get currentBet(): InternalBet {
    return this._bet as InternalBet;
  }

  get currentLine(): number {
    return this._lines;
  }

  get isMaxBet(): boolean {
    return this.getMaxBet() == this._bet;
  }

  get isMaxBetOrGreater(): boolean {
    const maxBet = this.getMaxBet();
    return (
      !!this._bet &&
      (Math.abs(maxBet.bet - this._bet.bet) < EPSILON || this._bet.bet - maxBet.bet > EPSILON)
    );
  }

  get isXtremeBetNow(): boolean {
    return !!this._bet?.isXtremeBet;
  }

  get isMaxXtremeBet(): boolean {
    return this._isXtremeBetEnable && this.getXtremeMaxBet() == this._bet;
  }

  get isExtraBetSupported(): boolean {
    return this.machineInfo.bets.some((arg) => arg.isExtraBet);
  }

  get isMinBet(): boolean {
    const localBets = this.machineInfo.bets.filter((b) => !b.isExtraBet);
    localBets.sort();
    return localBets[0] == this._bet;
  }

  Init(): void {
    // this.tutorial = this.machineInfo.tutorialInfo;
    this._specialChangeBetComponent =
      this._container.resolve<SpecialChangeBetComponent>(T_SpecialChangeBetComponent) ?? null;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._userInfoHolder =
      this._container.forceResolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder);
    this._slotPopupCoordinator =
      this._container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._gameOperation = this._container.forceResolve<GameOperation>(T_GameOperation);
    this._slotBetStorageProvider =
      this._container.forceResolve<SlotBetStorageProvider>(T_SlotBetStorageProvider);
    this._clientProperties = this._container.forceResolve<IClientProperties>(T_IClientProperties);
    this._balanceUpdater = this._container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);
    const notifierComponent = this._container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    notifierComponent.notifier.AddListener(this);
    this._xtremeBetInfo = this.machineInfo.xtremeBetInfo;

    this._bet = this.getCurrentBetFromSavedStorageOrDefault(false);

    if (this.machineInfo.spinResult && this.machineInfo.spinResult.isFreeSpins) {
      const fsg = this.machineInfo.spinResult.freeSpinsInfo!
        .currentFreeSpinsGroup as InternalFreeSpinsGroup;
      const restoredBet = this.createCurrentBetBasedOnResponse(fsg.bet, -1.0, fsg?.betCalculation);
      this._bet = restoredBet;
    } else if (this.machineInfo.spinResult && this.machineInfo.spinResult.isBonus) {
      const br = this.machineInfo.spinResult.bonusInfo?.result as BonusResult;
      const fsg = this.machineInfo.spinResult?.freeSpinsInfo
        ?.currentFreeSpinsGroup as InternalFreeSpinsGroup;
      const restoredBet = this.createCurrentBetBasedOnResponse(br.bet, -1.0, fsg?.betCalculation);
      this._bet = restoredBet;
    } else if (this.machineInfo.spinResult && this.machineInfo.spinResult.isScatter) {
      const sr = this.machineInfo.spinResult.scatterInfo!.result as BonusResult;
      const fsg = this.machineInfo.spinResult?.freeSpinsInfo
        ?.currentFreeSpinsGroup as InternalFreeSpinsGroup;
      this._bet = this.createCurrentBetBasedOnResponse(sr.bet, -1.0, fsg?.betCalculation);
    }

    this.updateTotalBet();
    this.SetTotalWin(0);
    this._currentBetIndex = this.machineInfo.bets.indexOf(this._bet);
    this.SetLines(this.machineInfo.maxLines);
    this.SetBetMultiplier(this.machineInfo.betMultiplier);
    this._registerKeys();
    // this._betUpdater = this._container.forceResolve<IBetUpdaterProvider>(T_IBetUpdaterProvider) as IBetUpdaterProvider;
    // this._betUpdaterSubscription = this._betUpdater.betsUpdated.listen(() => this.onBetsUpdated());
  }

  async updateBetsOnWhenStateChanged(): Promise<void> {
    // if (this._nextBets) {
    //   const bets = this._betUpdater.bets;
    //   this._nextBets = null;
    //   if (this._nextXtremeBetInfo) {
    //     this._xtremeBetInfo = this._nextXtremeBetInfo;
    //   }
    //   this._nextXtremeBetInfo = null;
    //   const isNewMaxBetAvailable = this.checkBetsForNewMaxBet(bets);
    //   const isNewXtremeMaxBetAvailable = this._isXtremeBetEnable && this._xtremeBetInfo && this.checkBetsForNewFeatureMaxBet(this._xtremeBetInfo.bets);
    //   const isPrevMaxBet = this.isMaxBet && isNewMaxBetAvailable;
    //   const isPrevXtremeMaxBet = this.isMaxXtremeBet && isNewXtremeMaxBetAvailable;
    //   for (const bet of this.Bets) {
    //     if (!bets.includes(bet) && bet.bet > bets[0].bet && !bet.isExtraBet && !bet.isXtremeBet) {
    //       bets.push(bet);
    //     }
    //   }
    //   if (this._isXtremeBetEnable && this._xtremeBetInfo) {
    //     for (const bet of this._xtremeBetInfo.bets) {
    //       if (!bets.includes(bet) && bet.bet > bets[0].bet) {
    //         bets.push(bet);
    //       }
    //     }
    //   }
    //   bets.sort((left, right) => (left.bet - right.bet));
    //   const betIndex = bets.indexOf(this._bet);
    //   const newBetIndex = Math.min(Math.max(betIndex, 0), bets.length);
    //   // If we didn't found index for extrabet(for example after levelUp)
    //   // we use first extrabet
    //   if (betIndex < 0 && this._bet.isExtraBet) {
    //     newBetIndex = bets.indexOf(bets.find((obj) => obj.isExtraBet));
    //   }
    //   if (betIndex < 0 && this._bet.isXtremeBet) {
    //     newBetIndex = bets.indexOf(bets.find((obj) => obj.isXtremeBet));
    //   }
    //   if (bets) {
    //     this.Bets = bets;
    //   }
    //   const betUpdated = false;
    //   if (this.isXtremeBetNow) {
    //     if (isPrevXtremeMaxBet) {
    //       this._propertyChangedController.dispatchEvent(SlotSessionProperties.UpdateMaxBet);
    //     }
    //     if (betIndex < 0) {
    //       const lastOrDefault = this.machineInfo.bets.find((e) => !e.isXtremeBet && !e.isExtraBet) || null;
    //       if (lastOrDefault && this._bet.bet < lastOrDefault.bet) {
    //         this._bet.isXtremeBet = false;
    //       }
    //       for (let i = this.machineInfo.bets.length - 1; i >= 1; i--) {
    //         if (this.machineInfo.bets[i].bet > this._bet.bet && this._bet.bet > this.machineInfo.bets[i - 1].bet) {
    //           this.machineInfo.bets.splice(i, 0, this._bet);
    //           break;
    //         }
    //       }
    //       await this.SetBet(this._bet);
    //       betUpdated = true;
    //     }
    //   }
    //   this.machineInfo.defaultBet = this._betUpdater.defaultBet;
    //   if (this._betUpdater.configuredBets) {
    //     this.machineInfo.configuredBets = this._betUpdater.configuredBets;
    //     this._propertyChangedController.dispatchEvent(SlotSessionProperties.NewConfiguredBetsAvailable);
    //   }
    //   if (this._betUpdater.xtremeBetInfo) {
    //     this.machineInfo.xtremeBetInfo = this._betUpdater.xtremeBetInfo;
    //   }
    //   const stickyMaxBetProvider = this._container.resolve(StickyMaxBetProvider);
    //   if (!betUpdated && (!(isPrevMaxBet || isPrevXtremeMaxBet) || !stickyMaxBetProvider || !stickyMaxBetProvider.isStickyBetAvailable)) {
    //     await this.SetBet(bets[newBetIndex]);
    //   }
    //   if (isPrevMaxBet) {
    //     this._propertyChangedController.dispatchEvent(SlotSessionProperties.UpdateMaxBet);
    //   }
    //   if (isNewMaxBetAvailable || isNewXtremeMaxBetAvailable) {
    //     this._propertyChangedController.dispatchEvent(SlotSessionProperties.NewBetAvailable);
    //   }
    //   await GameTimer.wait(0.05);
    //   this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
    // }
  }

  onBetsUpdated(_e: any): void {
    // this._nextBets = this._betUpdater.bets;
    // this._nextXtremeBetInfo = this._betUpdater.xtremeBetInfo;
  }

  private _registerKeys(): void {
    if (!this._keysSub) {
      // this._keysSub = window.onkeydown?.bind((ev:KeyboardEvent) => this.onKeyClosure(ev));
    }
  }

  private onKeyClosure = (e: KeyboardEvent): void => {
    if (
      e.keyCode == Key.Enter || // Spin
      e.keyCode == Key.Space || // Spin
      e.keyCode == Key.I || // Custom Icons Spin
      e.keyCode == Key.S || // Free spins
      e.keyCode == Key.F8 || // Custom cheat
      e.keyCode == Key.B || // Bonus
      e.keyCode == Key.Q || // QA cheat
      e.keyCode == Key.V || // visibility on
      e.keyCode == Key.N // visibility off
    ) {
      // for (const listener of this.keyPressedListeners) {
      //   listener(e.keyCode);
      // }
      // if (e.keyCode == html.KeyCode.SPACE) {
      //   e.preventDefault();
      // }
    }
  };

  RegisterKeyListener(_listenCallback: (keyCode: number) => void): void {
    // this.keyPressedListeners.push(listenCallback);
  }

  async SetBet(bet: InternalBet): Promise<void> {
    if (!this.machineInfo) {
      return;
    }

    if (this._bet?.bet == bet.bet) {
      return;
    }

    await this.tryShowMaxBetExceeded(bet);

    this._currentBetIndex = this.machineInfo.bets.indexOf(this._bet as InternalBet);
    this.updateTotalBet();
    this.updateBetType();

    const internalBet = this._bet as InternalBet;
    this._slotBetStorageProvider.saveBet(internalBet.bet, this.machineInfo.maxLines);

    this._propertyChangedController.dispatchEvent(SlotSessionProperties.Bet);
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.Bets);
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);

    const slotActionProvider = this._container.resolve<ISlotPrimaryAnimationProvider>(
      T_ISlotPrimaryAnimationProvider
    );
    if (slotActionProvider) {
      slotActionProvider.clearWinLines();
    }
  }

  private async tryShowMaxBetExceeded(bet: InternalBet): Promise<void> {
    const maxBet = this.getMaxBet();

    if (this._bet == maxBet && bet.isExtraBet) {
      this._slotPopupCoordinator.onPopupShown(SlotPopups.MaxBetExceeded);
      this._bet = maxBet;
      this._slotPopupCoordinator.onPopupHidden(SlotPopups.MaxBetExceeded);
    } else {
      this._bet = bet;
    }
  }

  SetBetMultiplier(betMultiplier: number): void {
    this._currentBetMultiplier = betMultiplier;
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetMultiplier);
  }

  updateBetType(): void {
    if (this.machineInfo) {
      if (this._bet?.bet === this.machineInfo.defaultBet) {
        this.BetType = 'default';
        return;
      }

      if (this.machineInfo.bets && this.machineInfo.bets.length > 0) {
        if (this.machineInfo.bets[this.machineInfo.bets.length - 1] === this._bet) {
          this.BetType = 'max';
          return;
        }
        if (this.machineInfo.bets[0] == this._bet) {
          this.BetType = 'min';
          return;
        }
      }

      // if (this._bet.isExtraBet) {
      //   this.BetType = "extraBet";
      // }

      this.BetType = 'custom';
    }
  }

  get BetIndex(): number {
    return this._currentBetIndex;
  }

  get Bets(): InternalBet[] {
    return this.machineInfo.bets;
  }

  set setBets(bets: InternalBet[]) {
    const _index = this.BetIndex < bets.length ? this.BetIndex : bets.length - 1;
    this.machineInfo.bets = bets.slice();
  }

  get isXtremeBetEnable(): boolean {
    return this._isXtremeBetEnable;
  }

  get xtremeMinBalanceRequired(): number {
    return this._xtremeBetInfo?.minBalanceRequired ?? 0.0;
  }

  set Bets(bets: InternalBet[]) {
    const _index = this.BetIndex < bets.length ? this.BetIndex : bets.length - 1;
    this.machineInfo.bets = bets.slice();
  }

  SetLines(line: number): void {
    if (this._lines != line) {
      this._lines = line;
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.Lines);
      this.updateTotalBet();
    }
  }

  SetTotalWin(totalWin: number): void {
    if (typeof totalWin === 'number') {
      this._totalWin = totalWin;
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.TotalWin);
    }
  }

  AddCurrentWin(totalWin: number, currentWin: number): void {
    if (typeof totalWin === 'number' && typeof currentWin === 'number') {
      this._totalWin = totalWin;
      this._currentWin = currentWin;
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.AddCurrentWin);
    }
  }

  ResetWinState(): void {
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.ResetWinState);
  }

  AddTotalWin(totalWin: number, currentWin: number): void {
    if (typeof totalWin === 'number' && typeof currentWin === 'number') {
      this._totalWin = totalWin;
      this._currentWin = currentWin;
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.AddTotalWin);
    }
  }

  get IsBalanceEnough(): boolean {
    if (
      !this._gameStateMachine.curResponse.freeSpinsInfo ||
      this._gameStateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.count == 0
    ) {
      try {
        return this._balanceUpdater.isBalanceEnough(this.totalBet);
      } catch (e) {
        this.notEnoughBalanceController.show();
        return false;
      }
    }
    return true;
  }

  decreaseBalanceAndStopUpdate(): void {
    if (
      !this._gameStateMachine.curResponse.freeSpinsInfo ||
      this._gameStateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.count === 0
    ) {
      try {
        this._balanceUpdater.decreaseBalanceAndStopUpdate(this.totalBet);
      } catch (e) {
        this.notEnoughBalanceController.show();
      }
    } else {
      this._balanceUpdater.decreaseBalanceAndStopUpdate(0.0);
    }
  }

  public updateBalance(): void {
    this._balanceUpdater.updateBalance();
  }

  updateTotalBet(): void {
    if (!this._bet || !this._lines) {
      return;
    }
    this._totalBet = this._bet.bet * this._lines;
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.TotalBet);
  }

  updateTotalBetEvent(): void {
    if (!this._bet || !this._lines) {
      return;
    }
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.TotalBet);
  }

  async changeBetIndex(indexDelta: number, userTriggered: boolean): Promise<void> {
    const bets = this.machineInfo.bets;
    const maxIndex = bets.length - 1;
    const currentIndex = bets.indexOf(this._bet as InternalBet);
    const newIndex = currentIndex + indexDelta;

    if (newIndex >= 0 && newIndex <= maxIndex) {
      if (!this._specialChangeBetComponent) {
        await this.SetBet(bets[newIndex]);
        if (userTriggered) {
          this._propertyChangedController.dispatchEvent(SlotSessionProperties.UserChangedBet);
        }
        this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
      } else {
        this._specialChangeBetComponent.ChangeBetIndex(indexDelta, userTriggered);
        this._propertyChangedController.dispatchEvent(SlotSessionProperties.SpecialBetIndex);
      }
    }
  }

  async setMaxAvailableBet(): Promise<boolean> {
    const availableBets = this.machineInfo.bets.filter(
      (b) => b.bet * this.currentLine <= this._userInfoHolder.user.balance
    );
    if (availableBets.length > 0) {
      await this.SetBet(this.getMaxBet());
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
      return true;
    } else {
      return false;
    }
  }

  async setMaxBet(): Promise<void> {
    if (!this._specialChangeBetComponent) {
      await this.SetBet(this.getMaxBet());
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
    } else {
      this._specialChangeBetComponent.SetMaxBet(false);
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.SpecialBetIndex);
    }

    this._propertyChangedController.dispatchEvent(SlotSessionProperties.UserMaxBet);
  }

  async setMaxFeatureBet(): Promise<void> {
    await this.SetBet(this.getMaxFeatureBet());
    this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
  }

  getMaxFeatureBet(): InternalBet {
    return this._isXtremeBetEnable ? this.getXtremeMaxBet() : this.getMaxBet();
  }

  getCurrentBetFromSavedStorageOrDefault(primaryUseStorageBet: boolean): InternalBet {
    let internalBet: InternalBet | null = null;
    const defaultBet = this.machineInfo.bets.find(
      (arg) => arg.bet == this.machineInfo.defaultBet
    ) as InternalBet;
    const storageBet = this._slotBetStorageProvider.getSavedBet();
    if (storageBet == 0.0) {
      internalBet = defaultBet as InternalBet;
    } else {
      let storageBetInSlotInfo =
        this.machineInfo.bets.find((arg) => arg.bet * this.machineInfo.maxLines == storageBet) ||
        null;

      if (!storageBetInSlotInfo && storageBet > defaultBet.bet * this.machineInfo.maxLines) {
        const betsBetweenStorageAndDefaultBet = this.machineInfo.bets
          .filter((arg) => arg.bet > defaultBet.bet)
          .reverse();
        if (betsBetweenStorageAndDefaultBet.length > 0) {
          storageBetInSlotInfo = betsBetweenStorageAndDefaultBet.reduce((current, next) =>
            Math.abs(current.bet * this.machineInfo.maxLines - storageBet) <
            Math.abs(next.bet * this.machineInfo.maxLines - storageBet)
              ? current
              : next
          );
        }
      }
      const maxBet = this.getMaxBet();
      internalBet =
        storageBetInSlotInfo && (primaryUseStorageBet || storageBetInSlotInfo.bet > defaultBet.bet)
          ? storageBetInSlotInfo
          : !storageBetInSlotInfo && storageBet > maxBet.bet * this.machineInfo.maxLines
            ? maxBet
            : defaultBet;
      this._slotBetStorageProvider.saveBet(internalBet.bet, this.machineInfo.maxLines);
    }
    return internalBet;
  }

  async setMinBet(): Promise<void> {
    if (!this._specialChangeBetComponent) {
      await this.SetBet(this.getMinBet());
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
    } else {
      this._specialChangeBetComponent.SetMinBet(false);
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.SpecialBetIndex);
    }
  }

  public getMaxBet(): InternalBet {
    const localBets = this.machineInfo.bets.filter((b) => !b.isExtraBet && !b.isXtremeBet);
    localBets.sort();
    return localBets[localBets.length - 1];
  }

  async setXtremeMaxBet(): Promise<void> {
    if (!this._specialChangeBetComponent) {
      await this.SetBet(this.getXtremeMaxBet());
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.BetIndex);
    } else {
      this._specialChangeBetComponent.SetXtremeMaxBet(false);
      this._propertyChangedController.dispatchEvent(SlotSessionProperties.SpecialBetIndex);
    }
  }

  private getXtremeMaxBet(): InternalBet {
    const localBets = this.machineInfo.bets.filter((b) => !b.isExtraBet);
    localBets.sort();
    return localBets[localBets.length - 1];
  }

  public getMinBet(): InternalBet {
    const localBets = this.machineInfo.bets.filter((b) => !b.isExtraBet);
    localBets.sort();
    return localBets[0];
  }

  private checkBetsForNewMaxBet(bets: InternalBet[]): boolean {
    if (!this.machineInfo) {
      return false;
    }
    return (
      CollectionEx.max(
        bets.filter((x) => !x.isExtraBet && !x.isXtremeBet),
        (e) => e.bet
      ) >
      CollectionEx.max(
        this.machineInfo.bets.filter((x) => !x.isExtraBet && !x.isXtremeBet),
        (e) => e.bet
      )
    );
  }

  private checkBetsForNewFeatureMaxBet(bets: InternalBet[]): boolean {
    if (!this.machineInfo) {
      return false;
    }
    return (
      CollectionEx.max(
        bets.filter((x) => !x.isExtraBet),
        (e) => e.bet
      ) >
      CollectionEx.max(
        this.machineInfo.bets.filter((x) => !x.isExtraBet),
        (e) => e.bet
      )
    );
  }

  dispose(): void {
    if (this._balanceUpdater) {
      this._balanceUpdater.unlockBalance();
    }

    // if (this._keysSub) {
    //   this._keysSub.cancel();
    //   this._keysSub = null;
    // }

    // this._propertyChangedController = null;
    // this.machineInfo = null;
    // this._betUpdaterSubscription.cancel();
    // this.keyPressedListeners.length = 0;
  }

  private updateFeatureBetTypes(): void {
    if (this._isXtremeBetEnable) {
      const minXtremeBet = this._xtremeBetInfo.bets.reduce((curr, next) =>
        curr.bet < next.bet ? curr : next
      );
      for (const bet of this.Bets) {
        if (bet.bet > minXtremeBet.bet - EPSILON) {
          bet.isXtremeBet = true;
        }
      }
    }
  }

  private createCurrentBetBasedOnResponse(
    bet: number,
    effectiveBet: number,
    calculationType: string | null
  ): InternalBet {
    const restoredBet = new InternalBet();
    restoredBet.bet = bet;
    restoredBet.effectiveBet = effectiveBet;
    if (this._isXtremeBetEnable) {
      const minXtremeBet = this._xtremeBetInfo.bets.reduce((curr, next) =>
        curr.bet < next.bet ? curr : next
      );
      if (restoredBet.bet > minXtremeBet.bet - EPSILON) {
        restoredBet.isXtremeBet = true;
      }
    }
    switch (calculationType) {
      case 'AVERAGE':
        restoredBet.calculationType = BetCalculationType.AVERAGE;
        break;
      case 'FREE_SPINS':
        restoredBet.calculationType = BetCalculationType.FREESPINS;
        break;
      case 'DEFAULT':
      default:
        restoredBet.calculationType = BetCalculationType.DEFAULT;
        break;
    }
    return restoredBet;
  }
}
