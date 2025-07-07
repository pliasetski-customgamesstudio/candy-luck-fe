import { Container } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { SlotSession, SlotSessionProperties } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { GameOperation } from '../../../../game_operation';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { IHudCoordinator } from '../i_hud_coordinator';
import { ChangeBetButtonsView } from '../views/change_bet_buttons_view';
import { ISpinResponse, T_GameOperation } from '@cgs/common';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_ISlotSessionProvider,
  T_IGameStateMachineProvider,
  T_IHudCoordinator,
} from '../../../../type_definitions';

export class ChangeBetButtonsController extends BaseSlotController<ChangeBetButtonsView> {
  private _slotSession: SlotSession;
  private _hudCoordinator: IHudCoordinator;
  private _gameOperation: GameOperation;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container, view: ChangeBetButtonsView) {
    super(container, view);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameOperation = container.forceResolve<GameOperation>(T_GameOperation);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._hudCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    this._hudCoordinator.available.listen((e) => this._onHudAvailable());
    this._hudCoordinator.unavailable.listen((e) => this._onHudUnavailable());
    this._hudCoordinator.hudEnable.listen((e) => this._onHudAvailable());
    this._hudCoordinator.hudDisable.listen((e) => this._onHudUnavailable());

    this._gameStateMachine.beginFreeSpins.entered.listen((s) => this.onFreeSpinsEntered());
    this._gameStateMachine.bonus.entered.listen((s) => this.onFreeSpinsEntered());
    this._gameStateMachine.scatter.entered.listen((s) => this.onFreeSpinsEntered());

    this._slotSession.propertyChanged.listen((e) => {
      if (
        e === SlotSessionProperties.TotalBet ||
        e === SlotSessionProperties.Bet ||
        e === SlotSessionProperties.Bets
      ) {
        this._updateView();
      }
    });
  }

  private onFreeSpinsEntered(): void {
    this.disableButtons();
  }

  private _onHudAvailable(): void {
    this._updateView();
  }

  private _onHudUnavailable(): void {
    this.disableButtons();
  }

  private _updateView(): void {
    if (
      !this._hudCoordinator.canChangeBet ||
      this._gameStateMachine.isAutoSpins ||
      !this._hudCoordinator.isAvailable
    ) {
      return;
    }

    if (
      this._slotSession.machineInfo.bets[this._slotSession.machineInfo.bets.length - 1].bet ===
      this._slotSession.currentBet.bet
    ) {
      this.view.disableIncreaseButton(this._slotSession.currentBet.isExtraBet);
    } else {
      this.view.enableIncreaseButton(
        this._slotSession.isMaxBet || this._slotSession.currentBet.isExtraBet
      );
    }
    if (this._slotSession.isMinBet) {
      this.view.disableDecreaseButton();
    } else {
      this.view.enableDecreaseButton(this._slotSession.currentBet.isExtraBet);
    }
  }

  private disableButtons(): void {
    const isExtraBetEnabled: boolean =
      (this._slotSession.isMaxBet || this._slotSession.currentBet.isExtraBet) &&
      this._slotSession.isExtraBetSupported;
    this.view.disableIncreaseButton(isExtraBetEnabled);
    this.view.disableDecreaseButton(this._slotSession.currentBet.isExtraBet);
  }

  public decreaseButtonClicked(): void {
    this._slotSession.changeBetIndex(-1, true);
  }

  public increaseButtonClicked(): void {
    this._slotSession.changeBetIndex(1, true);
  }
}
