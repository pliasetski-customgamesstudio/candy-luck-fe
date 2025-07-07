import { ISpinResponse, IStorageRepositoryProvider } from '@cgs/common';
import { EventDispatcher, Container, FunctionAction } from '@cgs/syd';
// import { BaseModularSlotGame } from '../../../base_modular_slot_game';
import { BaseSlotController } from '../../base_slot_controller';
import { GameStateMachineNotifierComponent } from '../../../components/game_state_machine_notifier_component';
import { GameTimeAccelerationProvider } from '../../../components/game_time_acceleration_provider';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_CheatComponent,
  T_GameStateMachineNotifierComponent,
  T_GameTimeAccelerationProvider,
  T_IHudCoordinator,
  T_ISlotGame,
  T_ISlotSessionProvider,
  T_IStorageRepositoryProvider,
} from '../../../../type_definitions';
import { IHudCoordinator } from '../i_hud_coordinator';
import { BaseListener } from '../listeners/base_listener';
import { FastSpinsView } from '../views/fast_spins_view';
import { CheatComponent } from '../../../components/cheat_component';

export class FastSpinsController extends BaseSlotController<FastSpinsView> {
  static readonly FAST_SPINS_KEY = 'FastSpinsStorageKey';
  private static readonly ALLOW_DISABLE_FAST_SPINS_DURING_FREE_SPINS: boolean = true;
  private _gameTimeAccelerationProvider: GameTimeAccelerationProvider[] = [];
  private _stateMachineListener: BaseListener<FastSpinsController>;
  private _isFastSpinAvailable: boolean;
  private _stateMachine: GameStateMachine<ISpinResponse>;
  private _slotSession: ISlotSessionProvider;
  private _clientDataRepositoryProvider: IStorageRepositoryProvider;
  private _cheatComponent: CheatComponent;

  get isFastSpinsEnable(): boolean {
    return this.view.isFastSpinsEnable;
  }

  private _fastSpinsCheckBoxClickedDispatcher = new EventDispatcher<void>();
  get fastSpinsCheckBoxClicked(): EventDispatcher<void> {
    return this._fastSpinsCheckBoxClickedDispatcher;
  }

  constructor(container: Container, view: FastSpinsView) {
    super(container, view);
    const game = container.resolve<ISlotGame>(T_ISlotGame);
    this._clientDataRepositoryProvider = container.forceResolve<IStorageRepositoryProvider>(
      T_IStorageRepositoryProvider
    );
    this._stateMachine = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ).gameStateMachine;
    this._slotSession = container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider);
    this._gameTimeAccelerationProvider.push(
      container.forceResolve<GameTimeAccelerationProvider>(T_GameTimeAccelerationProvider)
    );

    this._cheatComponent = this._container.forceResolve<CheatComponent>(T_CheatComponent);

    // if (game instanceof BaseModularSlotGame) {
    //   for (const module of game.modules) {
    //     this._gameTimeAccelerationProvider.push(module.getComponent(GameTimeAccelerationProvider));
    //   }
    // }
    this._stateMachineListener = new FastSpinsListener(container, this);
    const hudCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    hudCoordinator.available.listen(() => this._onHudAvailable());
    hudCoordinator.unavailable.listen(() => this._onHudUnavailable());
    hudCoordinator.hudEnable.listen(() => this._onHudAvailable());
    hudCoordinator.hudDisable.listen(() => this._onHudUnavailable());

    this._stateMachine.beginBonus.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.onMiniGameEntered())
    );
    this._stateMachine.bonusRecovery.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.onMiniGameEntered())
    );
    this._stateMachine.beginScatter.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.onMiniGameEntered())
    );
    this._stateMachine.beginFreeSpinsPopup.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.onMiniGameEntered())
    );
    this._stateMachine.endFreeSpinsPopup.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.onMiniGameEntered())
    );
    this._stateMachine.accelerate.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.onMiniGameExited())
    );

    this._isFastSpinAvailable = true;
    for (const provider of this._gameTimeAccelerationProvider) {
      this._isFastSpinAvailable = this._isFastSpinAvailable && provider.isFastSpeedAvailable();
    }
    this._showFastSpinsIfAvailable();
  }

  private onMiniGameEntered(): () => void {
    if (
      this._stateMachine.curResponse.isFreeSpins &&
      this._stateMachine.curResponse.freeSpinsInfo!.event === FreeSpinsInfoConstants.FreeSpinsAdded // &&
      //   (this._slotSession.GameId! === "58" ||
      //     this._slotSession.GameId! === "88" ||
      //     this._slotSession.GameId! === "94" ||
      //     this._slotSession.GameId === "94")
      // ) {
    ) {
      return () => {};
    }
    return () => this.disableFastSpinsButton();
  }

  private onMiniGameExited(): () => void {
    return () => this.enableFastSpinsButton();
  }

  private _onHudAvailable(): void {
    this.enableFastSpinsButton();
  }

  private _onHudUnavailable(): void {
    if (!this._cheatComponent.getFastSpinMode() || !FastSpinsController.ALLOW_DISABLE_FAST_SPINS_DURING_FREE_SPINS) {
      this.disableFastSpinsButton();
    }
  }

  private _showFastSpinsIfAvailable(): void {
    if (this._isFastSpinAvailable) {
      this.view.showFastSpins();
    }
  }

  private _hideFastSpinsButton(): void {
    this.view.hideFastSpins();
  }

  public onFastSpinsCheckBoxClicked(): void {
    this._clientDataRepositoryProvider.createItem(
      FastSpinsController.FAST_SPINS_KEY,
      this.view.isFastSpinsEnable.toString()
    );
    if (this.view.isFastSpinsEnable) {
      for (const provider of this._gameTimeAccelerationProvider) {
        provider.trySetNewValues();
      }
    } else {
      for (const provider of this._gameTimeAccelerationProvider) {
        provider.resetGameTimeScale();
      }
    }

    this._fastSpinsCheckBoxClickedDispatcher.dispatchEvent();
  }

  public switchFastSpins(): void {
    if (this._isFastSpinAvailable) {
      this.view.activateFastSpins();
    }
  }

  public enableFastSpinsButton(): void {
    this.view.enableFastSpins();
  }

  public disableFastSpinsButton(): void {
    this.view.disableFastSpins();
  }
}

export class FastSpinsListener extends BaseListener<FastSpinsController> {
  static readonly FAST_SPINS_KEY = 'FastSpinsStorageKey';
  private _clientDataRepositoryProvider: IStorageRepositoryProvider;

  constructor(container: Container, controller: FastSpinsController) {
    super(container);
    this.ListenerController = controller;
    this._clientDataRepositoryProvider = container.forceResolve<IStorageRepositoryProvider>(
      T_IStorageRepositoryProvider
    );
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        if (this.ListenerController.isFastSpinsEnable) {
        }
        break;
      case GameStateMachineStates.InitGame:
        const isFastSpinsActive = false;
        // (_clientDataRepositoryProvider.readItem(FAST_SPINS_KEY)) ? (_clientDataRepositoryProvider.readItem(FAST_SPINS_KEY)).toLowerCase() == "true" : false;
        if (isFastSpinsActive) {
          this.ListenerController.switchFastSpins();
        }
        break;
    }
  }
}
