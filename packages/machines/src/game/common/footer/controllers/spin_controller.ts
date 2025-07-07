import {
  IClientProperties,
  ISpinResponse,
  InternalFreeSpinsGroup,
  T_IClientProperties,
} from '@cgs/common';
import {
  SceneObject,
  ActionActivator,
  Container,
  EmptyAction,
  SequenceAction,
  FunctionAction,
} from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { ISlotPopupCoordinator } from '../../slot_popup_coordinator';
import { SlotSession, SlotSessionProperties } from '../../slot_session';
import { IconRespinFeatureProvider } from '../../../components/icon_respin_feature_provider';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { ProgressiveBreakerProvider } from '../../../components/node_tap_action/progressive_breaker/progressive_breaker_provider';
import { ResourcesComponent } from '../../../components/resources_component';
import { ISpinViewConditionComponent } from '../../../../i_spin_view_condition_component';
import { ISpinParams } from '../../../../reels_engine/game_components/i_spin_params';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotGameEngine } from '../../../../reels_engine/i_slot_game_engine';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import { IHudCoordinator } from '../i_hud_coordinator';
import { ISpinController } from '../i_spin_controller';
import { SpinViewMachineListener } from '../listeners/spin_view_machine_listener';
import { SpinView, SpinViewState } from '../views/spin_view';
import { ISpinAnimation } from '@cgs/features';
import {
  T_ISlotSessionProvider,
  T_ISlotGameEngineProvider,
  T_ISlotPopupCoordinator,
  T_IHudCoordinator,
  T_ISpinParams,
  T_ResourcesComponent,
  T_ISpinViewConditionComponent,
  T_SpinViewMachineListener,
  T_IconRespinFeatureProvider,
  T_ProgressiveBreakerProvider,
} from '../../../../type_definitions';
import { Key } from 'ts-keycode-enum';

export class SpinController extends BaseSlotController<SpinView> implements ISpinController {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _gameEngine: ISlotGameEngine;
  private _slotSession: SlotSession;
  private spinViewMachineListener: SpinViewMachineListener;
  private _hudCoordinator: IHudCoordinator;
  private _spinParams: ISpinParams;
  private _spinAnimation: ISpinAnimation;
  private _spinViewConditionComponent: ISpinViewConditionComponent | null;
  private _host: SceneObject;
  private _activator: ActionActivator;
  private _canSpin: boolean = true;
  private _slotPopupCoordinator: ISlotPopupCoordinator;
  private _isNewAutoSpinEnabled: boolean;
  private _clientProperties: IClientProperties;
  private _spinBtnSkipIds: string[] = ['125', '139', '144', '20144', '20125'];

  constructor(container: Container, view: SpinView) {
    super(container, view);
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._spinViewConditionComponent = container.resolve<ISpinViewConditionComponent>(
      T_ISpinViewConditionComponent
    );
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    this._slotPopupCoordinator =
      container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    view.root.eventReceived.listen((e) => {
      if (e instanceof KeyboardEvent) {
        this._onKeyboardEvent(e as KeyboardEvent);
      }
    });
    this._gameStateMachine = this.gameStateMachineNotifier.gameStateMachine;

    this._gameStateMachine.freeSpins.entered.listen(() => this.onBeginFreeSpinsEntered());
    this._gameStateMachine.beginFreeSpinsPopup.entered.listen(() => this.onBeginFreeSpinsEntered());
    this._gameStateMachine.freeSpinsRecovery.entered.listen(() => this.onBeginFreeSpinsEntered());

    this._hudCoordinator = container.forceResolve<IHudCoordinator>(
      T_IHudCoordinator
    ) as IHudCoordinator;
    this._hudCoordinator.available.listen(() => this._onHudAvailable());
    this._hudCoordinator.unavailable.listen(() => this._onHudUnavailable());
    this._hudCoordinator.hudEnable.listen(() => this._onHudAvailable());
    this._hudCoordinator.hudDisable.listen(() => this._onHudDisable());
    this._spinParams = container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams;
    // this._spinAnimation = container.forceResolve<ISpinAnimation>(T_ISpinAnimation);
    this.spinViewMachineListener =
      container.forceResolve<SpinViewMachineListener>(T_SpinViewMachineListener);
    this.spinViewMachineListener.viewController = this;
    this._host = (
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent) as ResourcesComponent
    ).root;
    this._activator = ActionActivator.withAction(this._host, new EmptyAction());

    this._slotSession.propertyChanged.listen((e) => {
      if (e == SlotSessionProperties.Bet) {
        this.onBetChanged();
      }

      if (e == SlotSessionProperties.Bets) {
        this.onBetsUpdated();
      }
    });
  }

  private get fsg(): InternalFreeSpinsGroup[] {
    return this._gameStateMachine.curResponse.freeSpinsInfo!
      .freeSpinGroups as InternalFreeSpinsGroup[];
  }

  private onBeginFreeSpinsEntered(): void {
    this.view.toDisableStopState(
      this._slotSession.currentBet.isExtraBet,
      (this._spinViewConditionComponent && this._spinViewConditionComponent.isSpinDisState()) ||
        (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
          this._gameStateMachine.curResponse.isFreeSpins &&
          this._gameStateMachine.curResponse.freeSpinsInfo!.freeSpinGroups!.some(
            (x) => x!.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName
          ))
    );
  }

  private onBetChanged(): void {
    this.enableSpins();
  }

  private onBetsUpdated(): void {
    this.enableSpins();
  }

  private _onHudUnavailable(): void {
    if (this.view.state != SpinViewState.StopDisabled) {
      this.disableSpinButton();
    }
  }

  private _onHudDisable(): void {
    if (this._gameStateMachine.isAutoSpins) {
      this.enableStopButtonOnAccelerate();
    } else {
      this.disableSpinButton();
    }
  }

  private _onHudAvailable(): void {
    this.enableSpins();
  }

  enableSpins(): void {
    if (
      this._gameStateMachine.curResponse &&
      !this._spinParams.autoSpin &&
      !this._slotPopupCoordinator.isPopupShown() &&
      (!this._gameStateMachine.curResponse.isFreeSpins ||
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this.view.toSpinState(
        this._slotSession.currentBet.isExtraBet,
        !this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
          this._gameStateMachine.curResponse.isFreeSpins &&
          this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
          this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
            FreeSpinsInfoConstants.FreeSpinsFinished
      );
    }
  }

  stopClicked(): void {
    if (this._spinParams.autoSpin) {
      if (!this._gameStateMachine.curResponse.isFreeSpins) {
        this._spinParams.autoSpin = false;
      }
      if (this._gameEngine.isSlotStopped) {
        this.view.toDisableSpinState(
          this._slotSession.currentBet.isExtraBet,
          !this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
            this._gameStateMachine.curResponse.isFreeSpins
        );
      } else {
        this.view.toDisableStopState(
          this._slotSession.currentBet.isExtraBet,
          (this._spinViewConditionComponent && this._spinViewConditionComponent.isStopDisState()) ||
            (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
              this._gameStateMachine.curResponse.isFreeSpins &&
              this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
              this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
                FreeSpinsInfoConstants.FreeSpinsStarted)
        );
      }
    }
    this._gameStateMachine.doStop();
  }

  public spinClicked(): void {
    const iconRespinFeatureProvider =
      this.container.resolve<IconRespinFeatureProvider>(T_IconRespinFeatureProvider) ?? null;

    if (iconRespinFeatureProvider) {
      iconRespinFeatureProvider.doSpin();
      return;
    }
    if (this.doSpin()) {
      //
    }
  }

  doSpin(): boolean {
    if (this._hudCoordinator.isAvailable) {
      if (this._slotSession.IsBalanceEnough) {
        if (!this._spinParams.autoSpin) {
          this.view.toDisableStopState(
            this._slotSession.currentBet.isExtraBet,
            (this._spinViewConditionComponent &&
              this._spinViewConditionComponent.isSpinDisState()) ||
              (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
                this._gameStateMachine.curResponse.isFreeSpins &&
                this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
                this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
                  FreeSpinsInfoConstants.FreeSpinsFinished)
          );
        }
        this._gameStateMachine.doSpin();
        return true;
      } else {
        this.decreaseBalanceAndStopUpdate();
      }
    }
    return false;
  }

  disableSpinButton(): void {
    if (
      !this._spinParams.autoSpin ||
      this._gameStateMachine.curResponse.isFreeSpins ||
      this._gameStateMachine.curResponse.isScatter ||
      this._gameStateMachine.curResponse.isBonus
    ) {
      if (
        this._gameStateMachine.curResponse.isFreeSpins &&
        this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
          FreeSpinsInfoConstants.FreeSpinsFinished
      ) {
        this.view.toDisableStopState(
          this._slotSession.currentBet.isExtraBet,
          (this._spinViewConditionComponent && this._spinViewConditionComponent.isStopDisState()) ||
            (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
              this._gameStateMachine.curResponse.isFreeSpins &&
              this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
              this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
                FreeSpinsInfoConstants.FreeSpinsStarted)
        );
      } else {
        this.view.toDisableSpinState(
          this._slotSession.currentBet.isExtraBet,
          (this._spinViewConditionComponent && this._spinViewConditionComponent.isStopDisState()) ||
            (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
              this._gameStateMachine.curResponse.isFreeSpins &&
              this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
              (!this.isUnderIdleState() ||
                this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
                  FreeSpinsInfoConstants.FreeSpinsFinished))
        );
      }
    }
  }

  private isUnderIdleState(): boolean {
    const _interactiveStates: string[] = [
      GameStateMachineStates.Idle,
      GameStateMachineStates.RegularSpin,
    ];
    return _interactiveStates.some((stateId) => this._gameStateMachine.isActive(stateId));
  }

  public disableStopButton(): void {
    if (
      !this._spinParams.autoSpin ||
      this._gameStateMachine.curResponse.isFreeSpins ||
      this._gameStateMachine.curResponse.isScatter ||
      this._gameStateMachine.curResponse.isBonus
    ) {
      this.view.toDisableStopState(
        this._slotSession.currentBet.isExtraBet,
        (this._spinViewConditionComponent && this._spinViewConditionComponent.isStopDisState()) ||
          (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
            this._gameStateMachine.curResponse.isFreeSpins &&
            this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
            this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
              FreeSpinsInfoConstants.FreeSpinsStarted)
      );
    }
  }

  public enableStopButton(): void {
    if (
      this._gameStateMachine.isAutoSpins &&
      (!this._gameStateMachine.curResponse.isFreeSpins ||
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsStarted)
    ) {
      this.view.toAutoSpinState(this._slotSession.currentBet.isExtraBet);
    } else {
      this.view.toStopState(
        this._slotSession.currentBet.isExtraBet,
        (this._spinViewConditionComponent && this._spinViewConditionComponent.isStopDisState()) ||
          (!this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
            this._gameStateMachine.curResponse.isFreeSpins &&
            this.fsg.some((x) => x.name != FreeSpinsInfoConstants.FreeRespinSpinsGroupName) &&
            this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
              FreeSpinsInfoConstants.FreeSpinsStarted)
      );
    }
  }

  public enableStopButtonOnAccelerate(): void {
    if (
      this._gameStateMachine.isAutoSpins &&
      (!this._gameStateMachine.curResponse.isFreeSpins ||
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsStarted ||
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this.view.toDisableAutoSpinState(this._slotSession.currentBet.isExtraBet);
    }
  }

  public decreaseBalanceAndStopUpdate(): void {
    this._slotSession.decreaseBalanceAndStopUpdate();
  }

  public updateBalance(): void {
    this._slotSession.updateBalance();
  }

  public verifyBalance(): void {
    if (this._spinParams.autoSpin && !this._slotSession.IsBalanceEnough) {
      this._spinParams.autoSpin = false;
      this.decreaseBalanceAndStopUpdate();
    }
  }

  public autoSpinClicked(): void {
    if (this.doSpin()) {
      this.startAutoSpin();
    } else {
      //ToOutOfCoins()
    }
  }

  private startAutoSpin(): void {
    this._spinParams.autoSpin = true;
    if (false) {
      this.view.toAutoSpinState(this._slotSession.currentBet.isExtraBet);
    } else {
      this.view.toStopState(
        this._slotSession.currentBet.isExtraBet,
        this._gameStateMachine.curResponse.isFreeSpins
      );
    }
  }

  public checkAutoSpinCondition(): void {
    if (this._spinParams.autoSpin) {
      const currentResponse = this._gameStateMachine.curResponse;
      if (currentResponse) {
        if (currentResponse.isFakeResponse) {
          this._spinParams.autoSpin = false;
          this.view.toDisableSpinState(
            this._slotSession.currentBet.isExtraBet,
            !this._spinBtnSkipIds.includes(this._slotSession.GameId) &&
              this._gameStateMachine.curResponse.isFreeSpins
          );
        }
      }
    }
  }

  private _onKeyboardEvent(event: KeyboardEvent): void {
    if (this._canSpin) {
      this._canSpin = false;
      const keyCode = event.keyCode;
      const progProv = this.container.forceResolve<ProgressiveBreakerProvider>(
        T_ProgressiveBreakerProvider
      );
      if (progProv) {
        (progProv as ProgressiveBreakerProvider).doBreak();
      }

      if (keyCode == Key.Enter || keyCode == Key.Space) {
        if (this.view.state == SpinViewState.SpinEnabled) {
          if (this.doSpin()) {
            //
          }
        } else if (
          this.view.state == SpinViewState.StopEnabled ||
          this.view.state == SpinViewState.AutospinEnabled
        ) {
          this.stopClicked();
        }
        event.preventDefault();
        // event.accept();
      }
      this._activator.action = new SequenceAction([
        new EmptyAction().withDuration(0.8),
        new FunctionAction(() => (this._canSpin = true)),
      ]);
      this._activator.start();
    }
  }
}
