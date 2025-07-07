import { ISpinResponse, InternalRespinSpecGroup, T_GameOperation } from '@cgs/common';
import { Container, EventStreamSubscription, State } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { SlotPopups } from '../../slot/views/base_popup_view';
import { ISlotPopupCoordinator } from '../../slot_popup_coordinator';
import { SlotSession, SlotSessionProperties } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { GameOperation } from '../../../../game_operation';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { IHudCoordinator } from '../i_hud_coordinator';
import { TotalBetView } from '../views/total_bet_view';
import {
  T_IGameStateMachineProvider,
  T_IHudCoordinator,
  T_ISlotPopupCoordinator,
  T_ISlotSessionProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';

export class TotalBetController extends BaseSlotController<TotalBetView> {
  private _slotSession: SlotSession;
  get slotSession(): SlotSession {
    return this._slotSession;
  }

  private _gameOperation: GameOperation;
  private _slotPopupCoordinator: ISlotPopupCoordinator;
  private _hudeCoordinator: IHudCoordinator;

  get hudeCoordinator(): IHudCoordinator {
    return this._hudeCoordinator;
  }

  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  private _extraBetToastReset: boolean = false;
  private _onEndFsSub: EventStreamSubscription<State>;
  get onEndFsSub(): EventStreamSubscription<State> {
    return this._onEndFsSub;
  }

  constructor(container: Container) {
    super(container, null);
    this._hudeCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._slotPopupCoordinator =
      container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameOperation = container.forceResolve<GameOperation>(T_GameOperation);

    this._slotSession.propertyChanged.listen((e) => {
      if (
        e === SlotSessionProperties.Bet ||
        e === SlotSessionProperties.Bets ||
        e === SlotSessionProperties.TotalBet
      ) {
        this.updateBets();
      }

      if (e === SlotSessionProperties.BetMultiplier) {
        this.setBetMultiplier(this._slotSession.currentBetMultiplier);
      }
    });

    this._gameStateMachine.init.entering.listen(() =>
      this._slotSession.SetBetMultiplier(this._slotSession.currentBetMultiplier)
    );
    this._gameStateMachine.init.entering.listen(() =>
      this.view.setTotalBet(
        this._slotSession.totalBet,
        this._slotSession.isMaxBet,
        this._slotSession.isXtremeBetNow
      )
    );
    this._gameStateMachine.bonusRecovery.entered.listen(() => this.onBonusRecoveryEntered());
    this._gameStateMachine.scatter.entered.listen(() => this.onBonusRecoveryEntered());
    this._gameStateMachine.freeSpins.entered.listen(() => this.onBeginFreeSpinsEntered());
    this._gameStateMachine.accelerate.entered.listen(() => this.onFreeSpinsEntered());
    this._gameStateMachine.beginFreeSpinsPopup.entered.listen(() => this.onBeginFreeSpinsEntered());
    this._gameStateMachine.freeSpinsRecovery.entered.listen(() => this.onBeginFreeSpinsEntered());
    this._gameStateMachine.freeSpinsRecovery.entered.listen(() =>
      this.view.setTotalBet(
        this._slotSession.totalBet,
        this._slotSession.isMaxBet,
        this._slotSession.isXtremeBetNow
      )
    );
    this._onEndFsSub = this._gameStateMachine.endFreeSpinsPopup.leaved.listen(() =>
      this.onFreePopupLeaved()
    );
    this._gameStateMachine.startGamble.leaved.listen(() => this.onGambleLeaved());
    this._gameStateMachine.accelerate.entered.listen(() => this.showExtraBetToastIfNeeded());

    this._hudeCoordinator.available.listen(() => {
      if (this._slotSession.currentBet.isExtraBet) {
        this.view.showExtraBet();
      }
      this.updateBets();
    });

    this._hudeCoordinator.unavailable.listen(() => {
      if (this._slotSession.currentBet.isExtraBet) {
        this.view.enableExtraBetPanelAlpha();
      }
    });

    this._slotPopupCoordinator.popupShown.listen((obj) => {
      if (obj == SlotPopups.MaxBetExceeded) {
        this._extraBetToastReset = true;
      }
    });
  }

  initialize(view: TotalBetView): void {
    super.view = view;
    super.view.controller = this;

    // view.extraBetInfoClicked.listen(event => this.onExtraBetInfoClicked(event));
  }

  updateBets(): void {
    if (this._hudeCoordinator.isAvailable && this._slotSession.currentBet.isExtraBet) {
      if (this._hudeCoordinator.canChangeBet) {
        const totalBet = this._slotSession.currentBet.bet * this._slotSession.currentLine;
        const effectiveBet =
          this._slotSession.currentBet.effectiveBet * this._slotSession.currentLine;
        this.view.setExtraBet(totalBet, effectiveBet);
        if (!this._gameStateMachine.isAutoSpins) {
          this.view.showExtraBet();
        }
      }
    } else {
      if (
        this._hudeCoordinator.canChangeBet &&
        (this._hudeCoordinator.isAvailable || this._gameStateMachine.isAutoSpins)
      ) {
        this.view.hideExtraBet();
        this.view.setTotalBet(
          this._slotSession.totalBet,
          this._slotSession.isMaxBet,
          this._slotSession.isXtremeBetNow
        );
      }
    }
  }

  showExtraBetToastIfNeeded(): void {
    if (this._extraBetToastReset) {
      this._extraBetToastReset = false;
      // if (this._slotSession.currentBet.isExtraBet) {
      //   this._toastShower.queryToast(new ExtraBetToast());
      // }
    }
  }

  setBetMultiplier(multiplier: number): void {
    this.view.setBetMultiplier(multiplier);
  }

  onExtraBetInfoClicked(): Promise<void> {
    return Promise.resolve();
  }

  onFreeSpinsEntered(): void {
    if (
      this._gameStateMachine.curResponse.isFreeSpins &&
      this._gameStateMachine.curResponse.freeSpinsInfo!.event !==
        FreeSpinsInfoConstants.FreeSpinsFinished
    ) {
      const respinGroup =
        this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
          ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
          : null;
      if (
        !respinGroup ||
        (respinGroup.respinStarted && respinGroup.respinCounter == respinGroup.groups.length)
      ) {
        this.view.setFreeSpinsMode(
          this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! - 1,
          this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! +
            this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.usedCount,
          this._slotSession.isMaxBet,
          this._slotSession.isXtremeBetNow,
          this._slotSession.totalBet,
          this._slotSession.currentBet.calculationType
        );
      }
    }
  }

  onBeginFreeSpinsEntered(): void {
    this.view.setFreeSpinsMode(
      this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count!,
      this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! +
        this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.usedCount,
      this._slotSession.isMaxBet,
      this._slotSession.isXtremeBetNow,
      this._slotSession.totalBet,
      this._slotSession.currentBet.calculationType
    );
  }

  onBonusRecoveryEntered(): void {
    if (this._gameStateMachine.curResponse.freeSpinsInfo) {
      this.view.setFreeSpinsMode(
        this._gameStateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup!.count! - 1,
        this._gameStateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup!.count! +
          this._gameStateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup!.usedCount,
        this._slotSession.isMaxBet,
        this._slotSession.isXtremeBetNow,
        this._slotSession.totalBet,
        this._slotSession.currentBet.calculationType
      );
    }
  }

  onFreePopupLeaved(): void {
    if (
      this._gameStateMachine.curResponse.isFreeSpins &&
      this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
        FreeSpinsInfoConstants.FreeSpinsFinished
    ) {
      this.view.disableFreeSpinsMode(
        this._slotSession.totalBet,
        this._slotSession.isMaxBet,
        this._slotSession.isXtremeBetNow
      );
    }
  }

  onGambleLeaved(): void {
    if (this._gameStateMachine.curResponse.freeSpinsInfo) {
      return;
    }
    this.view.disableFreeSpinsMode(
      this._slotSession.totalBet,
      this._slotSession.isMaxBet,
      this._slotSession.isXtremeBetNow
    );
  }
}
