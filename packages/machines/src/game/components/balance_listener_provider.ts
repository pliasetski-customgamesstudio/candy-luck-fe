import {
  ActionActivator,
  ActionFactory,
  BitmapTextSceneObject,
  Container,
  EmptyAction,
  EventDispatcher,
  EventStream,
  IStreamSubscription,
  SceneObject,
  SoundSceneObject,
  Vector2,
} from '@cgs/syd';
import {
  CoinType,
  ISimpleUserInfoHolder,
  NotEnoughBalanceException,
  NumberFormatter,
  T_IBalanceUpdaterRegistrator,
  T_ISimpleUserInfoHolder,
} from '@cgs/common';
import { GameComponentProvider } from './game_component_provider';
import { SlotSession } from '../common/slot_session';
import { IBalanceUpdaterRegistrator } from '@cgs/common';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider, T_ResourcesComponent } from '../../type_definitions';
import { ResourcesComponent } from './resources_component';

export interface IBalanceUpdater {
  decreaseBalanceAndStopUpdate(decreaseAmount: number): void;
  updateBalance(): void;
  unlockBalance(): void;
  lockBalance(lockAmount: number): void;
  resumeUpdateWithDisplayed(animate?: boolean): void;
  isBalanceEnough(sum: number): boolean;
  addBalanceToShown(sumToAdd: number): void;
  resumeUpdateWithCoin(startPosition: Vector2, coinType?: CoinType): void;
  piggyBankAnim(newPercent: number, animate?: boolean): void;
  resumeUpdate(animate?: boolean): void;
}

const BALANCE_UPDATE_ANIM_DURATION = 1;

export class BalanceListenerProvider extends GameComponentProvider {
  private _container: Container;
  private _slotSession: SlotSession;
  private _balanceUpdaterRegistrator: IBalanceUpdaterRegistrator;
  private _slotBalanceListener: SlotBalanceListener | null;

  private _startLocalTime: number;
  private _deltaTimeFromStartLocalTime: number = 0.0;

  private _balanceUpdateSub: IStreamSubscription | null;

  constructor(container: Container) {
    super();
    this._container = container;
    this._balanceUpdaterRegistrator = this._container.forceResolve(T_IBalanceUpdaterRegistrator);
    this._slotSession =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const userInfoHolder =
      this._container.forceResolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder);
    const root = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).footer;
    this._slotBalanceListener = new SlotBalanceListener(root, userInfoHolder);
    this._balanceUpdaterRegistrator.register(this._slotBalanceListener);
    this._balanceUpdateSub = this._slotBalanceListener.balanceUpdate.listen(() =>
      this._slotBalanceListenerOnBalanceUpdate()
    );
  }

  private _slotBalanceListenerOnBalanceUpdate() {
    if (this._slotSession.isXtremeBetEnable) {
      this._unregisterSlotBalanceListener();
    }
  }

  public deinitialize() {
    this._unregisterSlotBalanceListener();
  }

  private _unregisterSlotBalanceListener() {
    if (this._slotBalanceListener) {
      this._balanceUpdaterRegistrator.unregister(this._slotBalanceListener);
      this._balanceUpdateSub?.cancel();
      this._balanceUpdateSub = null;
      this._slotBalanceListener = null;
    }
  }
}

export class SlotBalanceListener implements IBalanceUpdater {
  private _balanceUpdateDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  public get balanceUpdate(): EventStream<void> {
    return this._balanceUpdateDispatcher.eventStream;
  }
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _lockedBalance: number = 0.0;
  private _root: SceneObject;
  private _activator: ActionActivator;
  private _targetBalance: number = 0.0;
  private _lastShownBalance: number = 0.0;
  private _coins: BitmapTextSceneObject[];
  private readonly _cashLoopSoundScene: SoundSceneObject | null;

  public get currentBalance(): number {
    return this._userInfoHolder.user.balance - this._lockedBalance;
  }

  constructor(root: SceneObject, userInfoHolder: ISimpleUserInfoHolder) {
    this._root = root;
    this._userInfoHolder = userInfoHolder;
    this._coins = this._root.parent?.findAllById<BitmapTextSceneObject>('Coins') || [];
    this._activator = ActionActivator.withAction(this._root, new EmptyAction());
    this.resumeUpdate(false);

    this._cashLoopSoundScene =
      this._root.parent?.findById<SoundSceneObject>('big_win_cash_loop') || null;
  }

  public getShownBalance(): number {
    return this._targetBalance;
  }

  public alreadyUpdatingBalanceToTarget(balance: number): boolean {
    return this._activator.started && Math.abs(this._targetBalance - balance) < 0.1;
  }

  public displayBalance(balance: number): void {
    this._lastShownBalance = balance;
    for (const coin of this._coins) {
      coin.text = NumberFormatter.formatMoney(balance);
    }
  }

  public setBalance(balance: number, animate: boolean): void {
    if (this.alreadyUpdatingBalanceToTarget(balance)) {
      return;
    }
    this._targetBalance = balance;

    if (animate) {
      this._activator.stop();

      const action = ActionFactory.CreateInterpolateDouble()
        .withValues(this._lastShownBalance, balance)
        .withDuration(BALANCE_UPDATE_ANIM_DURATION);
      action.valueChange.listen((value: number) => {
        this.displayBalance(value);
      });

      action.beginning.listen(() => {
        this._cashLoopSoundScene?.stateMachine?.switchToState('stop');
        this._cashLoopSoundScene?.stateMachine?.switchToState('play');
      });

      action.done.listen(() => {
        console.log('Balance update finished: ' + balance.toString());
        this._cashLoopSoundScene?.stateMachine?.switchToState('stop');
      });

      this._activator = ActionActivator.withAction(this._root, action);

      this._activator.start();
    } else {
      this._activator.stop();
      this.displayBalance(balance);
    }
  }

  public decreaseBalanceAndStopUpdate(decreaseAmount: number): void {
    const visibleBalance = this.getShownBalance();
    if (Math.abs(visibleBalance - this.currentBalance) >= 1) {
      this.setBalance(this.currentBalance, false);
    }

    const targetBalance = this.currentBalance - decreaseAmount;
    if (targetBalance < 0) {
      throw new NotEnoughBalanceException(
        `Can't afford the bet of ${decreaseAmount} with the balance ${this.currentBalance}`
      );
    }

    this.setBalance(targetBalance, false);
  }

  public updateBalance(): void {
    if (this.getShownBalance() !== this.currentBalance) {
      this.setBalance(this._userInfoHolder.user.balance, false);
    }
  }

  public unlockBalance(): void {
    this._lockedBalance = 0.0;
  }

  public lockBalance(lockAmount: number): void {
    this._lockedBalance = lockAmount;
  }

  public resumeUpdateWithDisplayed(animate: boolean = true): void {
    this._userInfoHolder.user.balance = this._targetBalance;
    this.resumeUpdate(animate);
  }

  public isBalanceEnough(sum: number): boolean {
    return this._userInfoHolder.user && this._userInfoHolder.user.balance >= sum;
  }

  public addBalanceToShown(sumToAdd: number): void {
    const _info = this._userInfoHolder.user;
    this.setBalance(this._targetBalance + sumToAdd, true);
    // setUser(info, _userInfoHolder.curLevelConfig, _userInfoHolder.nextLevelConfig, false);
  }

  public resumeUpdateWithCoin(startPosition: Vector2, _coinType: CoinType = CoinType.Spiral): void {
    const _info = this._userInfoHolder.user;
    this.setBalance(this.currentBalance, true);
  }

  public piggyBankAnim(newPercent: number, _animate: boolean = true): void {}

  public resumeUpdate(animate: boolean = true): void {
    const _info = this._userInfoHolder.user;
    this.setBalance(this.currentBalance, animate);
  }
}
