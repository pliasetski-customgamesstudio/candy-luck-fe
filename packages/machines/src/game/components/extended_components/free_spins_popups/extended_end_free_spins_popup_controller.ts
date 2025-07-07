import {
  IClientProperties,
  IAuthorizationHolder,
  T_IClientProperties,
  NumberFormatter,
  ISpinResponse,
  T_IAuthorizationHolder,
  InternalFreeSpinsGroup,
} from '@cgs/common';
import { Container } from '@cgs/syd';
import { BaseSlotPopupController } from '../../../common/slot/controllers/base_popup_controller';
import { SlotSession } from '../../../common/slot_session';
import { IFreeSpinsModeProvider } from '../../free_spins/i_free_spins_mode_provider';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { IBonusSharer, T_IBonusSharer } from '../../../../i_bonus_sharer';
import { LobbyFacade } from '../../../../lobby_facade';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IFreeSpinsModeProvider,
  T_IFreeSpinsPopupViewUpdater,
  T_ISlotSessionProvider,
  T_LobbyFacade,
} from '../../../../type_definitions';
import { ExtendedEndFreeSpinsPopupView } from './extended_end_free_spins_popup_view';
import { IFreeSpinsPopupViewUpdater } from '../../free_spins/i_free_spins_popup_view_updater';

export class ExtendedEndFreeSpinsPopupController extends BaseSlotPopupController<ExtendedEndFreeSpinsPopupView> {
  private _endFreeSpinsPopupController: ExtendedEndFreeSpinsPopupController;
  private _freeSpinsModeProvider: IFreeSpinsModeProvider;
  private _useFreespinMode: boolean;
  private _useViewUpdater: boolean;
  private _clientProperties: IClientProperties;
  private _isSecondShow: boolean = false;
  private _sharer: IBonusSharer;
  private _respinName: string[];
  private _baseGameFS: string[];
  private _slotSession: SlotSession;
  private _authorizationHolder: IAuthorizationHolder;

  constructor(
    container: Container,
    popupView: ExtendedEndFreeSpinsPopupView,
    stopBackgroundSound: boolean,
    useFreespinMode: boolean = false,
    useViewUpdater: boolean = true,
    respinsName: string[] | null,
    baseGameFS: string[] | null
  ) {
    super(container, popupView, stopBackgroundSound);
    this._useViewUpdater = useViewUpdater;
    let respinsNames = respinsName;
    if (!respinsNames || !respinsNames.length) {
      respinsNames = ['freeRespin'];
    }
    this._respinName = respinsNames;
    let fsTypes = baseGameFS;
    if (!fsTypes || !fsTypes.length) {
      fsTypes = ['free'];
    }
    this._baseGameFS = fsTypes;
    this._freeSpinsModeProvider =
      container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
    this._useFreespinMode = useFreespinMode;
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._sharer = container.forceResolve<IBonusSharer>(T_IBonusSharer);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
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
        if (!this.gameStateMachineNotifier.gameStateMachine.curResponse.isFakeResponse)
          this.view.show();
        break;
      default:
        break;
    }
  }

  public async doShare(): Promise<void> {}

  public onEndFreeSpinShown(): void {
    if (
      !this.gameStateMachineNotifier.gameStateMachine.curResponse ||
      this.gameStateMachineNotifier.gameStateMachine.curResponse.isFakeResponse
    )
      return;
    if (this._useViewUpdater) {
      const viewUpdater = this.container.resolve<IFreeSpinsPopupViewUpdater>(
        T_IFreeSpinsPopupViewUpdater
      );
      if (viewUpdater) {
        viewUpdater.updateViewBeforeShowingPopup(this.view.view);
      }
    }

    const currentResponse = this.gameStateMachineNotifier.gameStateMachine.curResponse;
    const previousResponse = this.gameStateMachineNotifier.gameStateMachine.prevResponse;
    let freeSpinsCount = 0;
    let totalWin = 0.0;
    if (currentResponse.freeSpinsInfo) {
      //FreeSpinsInfo can be null if the client didn't receive response with "finished" fs event
      if (
        currentResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
        this._baseGameFS.includes(currentResponse.freeSpinsInfo.name)
      ) {
        freeSpinsCount = previousResponse.freeSpinsInfo!.totalFreeSpins;
        totalWin = currentResponse.totalWin;
      } else if (
        this._respinName.includes(currentResponse.freeSpinsInfo.name) &&
        currentResponse.freeSpinsInfo.freeSpinGroups?.some((x) =>
          this._baseGameFS.includes((x as InternalFreeSpinsGroup).name!)
        )
      ) {
        freeSpinsCount = currentResponse.freeSpinsInfo.currentFreeSpinsGroup?.usedCount as number;
        totalWin = currentResponse.totalWin;
      } else {
        freeSpinsCount = currentResponse.freeSpinsInfo.currentFreeSpinsGroup?.usedCount as number;
        totalWin = currentResponse.freeSpinsInfo.totalWin;
      }
    }
    let state =
      this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo?.name ?? 'free';
    if (this._useFreespinMode) {
      if (
        currentResponse.freeSpinsInfo?.event == FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
        this._baseGameFS.includes(currentResponse.freeSpinsInfo?.name)
      ) {
        state =
          this._respinName.find((arg) => arg == previousResponse.freeSpinsInfo!.name) ||
          this._respinName[0];
      }
      this.view.postEvent(state);
    }
    this.view.setSpins(NumberFormatter.format(freeSpinsCount));
    if (this._respinName.includes(state)) {
      this.view.setTotalWin(totalWin, true);
    } else {
      this.view.setTotalWin(totalWin);
    }
    if (this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo)
      this.view.setMode(
        this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo?.totalWin > 0
      );

    if (this._freeSpinsModeProvider) {
      this.view.setFreeSpinsMode(
        this._freeSpinsModeProvider.modePickerId!,
        this._freeSpinsModeProvider.currentMode ? this._freeSpinsModeProvider.currentMode : ''
      );
    }
  }

  public showPopupAfterRespin(
    currentResponse: ISpinResponse,
    _previousResponse: ISpinResponse
  ): void {
    let freeSpinsCount = 0;
    let _totalWin = 0.0;
    if (currentResponse.freeSpinsInfo) {
      freeSpinsCount =
        this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.freeSpinGroups?.find(
          (x) => this._baseGameFS.includes((x as InternalFreeSpinsGroup).name!)
        )?.usedCount ?? 0;
      _totalWin =
        this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.totalWin;
    }
    if (this._useFreespinMode) {
      let state = 'free';
      if (currentResponse.freeSpinsInfo) {
        state =
          currentResponse.freeSpinsInfo.freeSpinGroups
            ?.slice()
            .reverse()
            .find((x) => this._baseGameFS.includes((x as InternalFreeSpinsGroup).name!))?.name ??
          'free';
      }
      this.view.postEvent(state);
    }
    this.view.setSpins(NumberFormatter.format(freeSpinsCount));
    this.view.setRebuyState(false, 0.0);
    this.view.setTotalWin(
      this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.totalWin
    );
    this.view.setMode(
      this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo!.totalWin > 0
    );

    if (this._freeSpinsModeProvider) {
      this.view.setFreeSpinsMode(
        this._freeSpinsModeProvider.modePickerId!,
        this._freeSpinsModeProvider.currentMode ? 'free' : ''
      );
    }
  }

  public async onPopupClosed(): Promise<void> {
    await super.onPopupClosed();
    await this.doShare();
  }

  public handleBackKey(): boolean {
    return false;
  }

  public onCloseClicked(): void {
    const response = this.gameStateMachineNotifier.gameStateMachine.curResponse;
    if (
      this._respinName.includes(response.freeSpinsInfo!.name) &&
      response.freeSpinsInfo!.freeSpinGroups?.some((x) =>
        this._baseGameFS.includes((x as InternalFreeSpinsGroup).name!)
      ) &&
      !this._isSecondShow
    ) {
      this.showPopupAfterRespin(
        this.gameStateMachineNotifier.gameStateMachine.curResponse,
        this.gameStateMachineNotifier.gameStateMachine.prevResponse
      );
      this._isSecondShow = true;
    } else {
      this._isSecondShow = false;
      this.view.hide();
      this.gameStateMachineNotifier.gameStateMachine.resume();
    }
  }
}
