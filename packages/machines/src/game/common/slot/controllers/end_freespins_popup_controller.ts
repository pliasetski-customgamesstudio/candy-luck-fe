import {
  IClientProperties,
  IAuthorizationHolder,
  T_IClientProperties,
  NumberFormatter,
  T_IAuthorizationHolder,
} from '@cgs/common';
import { Container } from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import { IFreeSpinsModeProvider } from '../../../components/free_spins/i_free_spins_mode_provider';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { IBonusSharer, T_IBonusSharer } from '../../../../i_bonus_sharer';
import { LobbyFacade } from '../../../../lobby_facade';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IFreeSpinsModeProvider,
  T_IFreeSpinsPopupViewUpdater,
  T_ISlotSessionProvider,
  T_LobbyFacade,
} from '../../../../type_definitions';
import { EndFreeSpinsPopupView } from '../views/end_freespins_popup_view';
import { BaseSlotPopupController } from './base_popup_controller';
import { IFreeSpinsPopupViewUpdater } from '../../../components/free_spins/i_free_spins_popup_view_updater';

export class EndFreeSpinsPopupController extends BaseSlotPopupController<EndFreeSpinsPopupView> {
  private _freeSpinsModeProvider: IFreeSpinsModeProvider;
  private _useFreespinMode: boolean;
  private _useViewUpdater: boolean;
  private _clientProperties: IClientProperties;
  private _slotSession: SlotSession;
  private _sharer: IBonusSharer;
  private _authorizationHolder: IAuthorizationHolder;

  constructor(
    container: Container,
    popupView: EndFreeSpinsPopupView,
    stopBackgroundSound: boolean,
    useFreespinMode: boolean = false,
    useViewUpdater: boolean = false
  ) {
    super(container, popupView, stopBackgroundSound);
    this._useViewUpdater = useViewUpdater;
    this._freeSpinsModeProvider =
      container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
    this._useFreespinMode = useFreespinMode;
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._sharer = container.forceResolve<IBonusSharer>(T_IBonusSharer);
    this._authorizationHolder = container
      .forceResolve<LobbyFacade>(T_LobbyFacade)
      .resolve(T_IAuthorizationHolder) as IAuthorizationHolder;
  }

  public async onPopupClosed(): Promise<void> {
    await super.onPopupClosed();
    await this.doShare();
  }

  public async doShare(): Promise<void> {
    this.gameStateMachineNotifier.gameStateMachine.resume();
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.onEndFreeSpinShown();
        this.gameStateMachineNotifier.gameStateMachine.curResponse.clearWinLines();
        this.gameStateMachineNotifier.gameStateMachine.curResponse.clearWinPositions();
        if (!this.gameStateMachineNotifier.gameStateMachine.curResponse.isFakeResponse)
          this.view.show();
        break;
      default:
        break;
    }
  }

  public onEndFreeSpinShown(): void {
    if (
      !this.gameStateMachineNotifier.gameStateMachine.curResponse ||
      this.gameStateMachineNotifier.gameStateMachine.curResponse.isFakeResponse
    )
      return;
    if (this._useFreespinMode) {
      this.view.postEvent(
        this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.name
      );
    }

    if (this._useViewUpdater) {
      const viewUpdater = this.container.forceResolve<IFreeSpinsPopupViewUpdater>(
        T_IFreeSpinsPopupViewUpdater
      );
      if (viewUpdater) {
        viewUpdater.updateViewBeforeShowingPopup(this.view.view);
      }
    }

    this.view.setSpins(
      NumberFormatter.format(
        this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.totalFreeSpins
      )
    );
    this.view.setRebuyState(false, 0.0);
    this.view.setTotalWin(
      NumberFormatter.format(
        this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.totalWin
      )
    );
    this.view.setMode(
      this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.totalWin > 0
    );

    if (this._freeSpinsModeProvider) {
      this.view.setFreeSpinsMode(
        this._freeSpinsModeProvider.modePickerId!,
        this._freeSpinsModeProvider.currentMode || ''
      );
    }
  }

  public onCloseClicked(): void {
    this.view.hide();
  }

  public handleBackKey(): boolean {
    return false;
  }
}
