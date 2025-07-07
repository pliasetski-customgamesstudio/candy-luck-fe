import {
  IClientProperties,
  T_IClientProperties,
  NumberFormatter,
  IAuthorizationHolder,
  T_IAuthorizationHolder,
} from '@cgs/common';
import { Container } from '@cgs/syd';
import { BaseSlotPopupController } from '../../../common/slot/controllers/base_popup_controller';
import { SlotSession } from '../../../common/slot_session';
import { IFreeSpinsModeProvider } from '../../free_spins/i_free_spins_mode_provider';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { IBonusSharer, T_IBonusSharer } from '../../../../i_bonus_sharer';
import { LobbyFacade } from '../../../../lobby_facade';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IFreeSpinsModeProvider,
  T_ISlotSessionProvider,
  T_LobbyFacade,
} from '../../../../type_definitions';
import { Game112EndFreeSpinsPopupView } from './game112_end_free_spins_popup_view';

export class Game112EndFreeSpinsPopupController extends BaseSlotPopupController<Game112EndFreeSpinsPopupView> {
  private _freeSpinsModeProvider: IFreeSpinsModeProvider;
  private _useFreespinMode: boolean;
  private _clientProperties: IClientProperties;
  private _slotSession: SlotSession;
  private _sharer: IBonusSharer;
  private _authorizationHolder: IAuthorizationHolder;

  constructor(
    container: Container,
    popupView: Game112EndFreeSpinsPopupView,
    stopBackgroundSound: boolean,
    useFreespinMode: boolean = false
  ) {
    super(container, popupView, stopBackgroundSound);
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

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.onEndFreeSpinShown();
        this.gameStateMachineNotifier.gameStateMachine.curResponse.clearWinLines();
        this.gameStateMachineNotifier.gameStateMachine.curResponse.clearWinPositions();
        this.view.show();
        break;
      default:
        break;
    }
  }

  public onEndFreeSpinShown(): void {
    const currentResponse = this.gameStateMachineNotifier.gameStateMachine.curResponse;
    let freeSpinsCount = 0;
    let totalWin = 0;
    if (currentResponse.freeSpinsInfo) {
      // FreeSpinsInfo can be null if the client didn't receive response with "finished" fs event
      freeSpinsCount = currentResponse.freeSpinsInfo.totalFreeSpins;
      totalWin = currentResponse.freeSpinsInfo.totalWin;
    }
    if (this._useFreespinMode) {
      const freeSpinType =
        this.gameStateMachineNotifier.gameStateMachine.curResponse.specialSymbolGroups!.find(
          (arg) => arg.type == 'FreeSpinType'
        );
      const collect = freeSpinType?.collectCount;
      let state = '';
      switch (collect) {
        case 0:
          state = 'freeGame';
          break;
        case 1:
          state = 'superGame';
          break;
        case 2:
          state = 'grandGame';
          break;
      }
      this.view.postEvent(state);
    }
    this.view.setSpins(NumberFormatter.format(freeSpinsCount));
    this.view.setRebuyState(false, 0.0);
    this.view.setTotalWin(totalWin, true);
    this.view.setMode(totalWin > 0);

    if (this._freeSpinsModeProvider) {
      this.view.setFreeSpinsMode(
        this._freeSpinsModeProvider.modePickerId,
        this._freeSpinsModeProvider.currentMode ? this._freeSpinsModeProvider.currentMode : ''
      );
    }
  }

  public onCloseClicked(): void {
    this.view.hide();
    this.gameStateMachineNotifier.gameStateMachine.resume();
  }

  public handleBackKey(): boolean {
    return false;
  }
}
