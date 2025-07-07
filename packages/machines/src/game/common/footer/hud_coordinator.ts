import { Container, EventDispatcher, EventStream } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
  GameStateMachineNotifier,
} from '../../components/game_state_machine_notifier_component';
import { ISlotSessionProvider } from '../../components/interfaces/i_slot_session_provider';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachineStates,
  GameStateMachine,
} from '../../../reels_engine/state_machine/game_state_machine';
import {
  T_GameStateMachineNotifierComponent,
  T_ISlotSessionProvider,
  T_ISlotPopupCoordinator,
} from '../../../type_definitions';
import { ISlotPopupCoordinator } from '../slot_popup_coordinator';
import { SlotSession } from '../slot_session';
import { IHudCoordinator } from './i_hud_coordinator';
import { ISpinResponse } from '@cgs/common';

export class HudCoordinator implements IHudCoordinator, AbstractListener {
  private _interactiveStates: string[] = [
    GameStateMachineStates.Idle,
    GameStateMachineStates.RegularSpin,
  ];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _slotPopupCoordinator: ISlotPopupCoordinator;
  get slotPopupCoordinator(): ISlotPopupCoordinator {
    return this._slotPopupCoordinator;
  }
  private _slotSession: SlotSession;

  constructor(container: Container) {
    const gsmComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine = gsmComponent.gameStateMachine;
    const notifier: GameStateMachineNotifier = gsmComponent.notifier;
    notifier.AddListener(this);
    this._slotPopupCoordinator =
      container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._slotPopupCoordinator.popupShown.listen(() => this._onPopupShown());
    this._slotPopupCoordinator.popupHidden.listen(() => this._onPopupHidden());
  }

  private rasiseAvailable(): void {
    this._availableDispatcher.dispatchEvent();
  }

  raiseUnavailable(): void {
    this._unavailableDispatcher.dispatchEvent();
  }

  private _onPopupShown(): void {
    this._unavailableDispatcher.dispatchEvent();
    this.fullDisable(true);
  }

  private _onPopupHidden(): void {
    if (this.isAvailable) {
      this._availableDispatcher.dispatchEvent();
    }
    this.fullDisable(false);
  }

  public enableHud(): void {
    if (this.isAvailable) {
      this._hudEnableDispatcher.dispatchEvent();
    }
  }

  public disableHud(): void {
    this._hudDisableDispatcher.dispatchEvent();
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
        this._unavailableDispatcher.dispatchEvent();
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this._unavailableDispatcher.dispatchEvent();
        break;
      case GameStateMachineStates.FreeSpin:
        this._unavailableDispatcher.dispatchEvent();
        break;
      case GameStateMachineStates.Scatter:
        this._unavailableDispatcher.dispatchEvent();
        break;
      case GameStateMachineStates.RegularSpin:
      case GameStateMachineStates.Idle:
        if (!this._slotPopupCoordinator.isPopupShown()) {
          this._availableDispatcher.dispatchEvent();
        }
        break;
    }
  }

  public OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.RegularSpin:
      case GameStateMachineStates.Idle:
        this._unavailableDispatcher.dispatchEvent();
        break;
      case GameStateMachineStates.Bonus:
        this._availableDispatcher.dispatchEvent();
        break;
    }
  }

  get isAvailable(): boolean {
    return (
      !this._slotPopupCoordinator.isPopupShown() &&
      this._interactiveStates.some((stateId) => this._gameStateMachine.isActive(stateId))
    );
  }

  get canChangeBet(): boolean {
    return (
      this._gameStateMachine.curResponse &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ===
          FreeSpinsInfoConstants.FreeSpinsFinished ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ===
          FreeSpinsInfoConstants.FreeSpinsStarted)
    );
  }

  get updateTotalWinAfterScatter(): boolean {
    return false;
  }

  get updateTotalWinOnRegularSpins(): boolean {
    return true;
  }

  private _availableDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get available(): EventStream<void> {
    return this._availableDispatcher.eventStream;
  }

  private _unavailableDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get unavailable(): EventStream<void> {
    return this._unavailableDispatcher.eventStream;
  }

  private _enabledDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get enabled(): EventStream<void> {
    return this._enabledDispatcher.eventStream;
  }

  private _disabledDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get disabled(): EventStream<void> {
    return this._disabledDispatcher.eventStream;
  }

  private _hudEnableDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get hudEnable(): EventStream<void> {
    return this._hudEnableDispatcher.eventStream;
  }

  private _hudDisableDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get hudDisable(): EventStream<void> {
    return this._hudDisableDispatcher.eventStream;
  }

  private _fullDisableDispatcher: EventDispatcher<boolean> = new EventDispatcher();
  get onFullDisabled(): EventStream<boolean> {
    return this._fullDisableDispatcher.eventStream;
  }

  public fullDisable(isDisabled: boolean): void {
    this._fullDisableDispatcher.dispatchEvent(isDisabled);
  }
}
