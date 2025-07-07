import { ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import { Action, Container, EmptyAction, SequenceSimpleAction } from '@cgs/syd';
import { EpicWinPopupController } from '../../common/slot/controllers/epic_win_popup_controller';
import { EpicWinPopupView } from '../../common/slot/views/epic_win_popup_view';
import { AwaitableAction } from '../../../reels_engine/actions/awaitable_action';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { EpicWinConfiguration } from '../epic_win/epic_win_configuration';

export class ExtendedEpicWinPopupController extends EpicWinPopupController {
  private _lazyShortAction: Action;
  private _featureName: string[] | null;
  private _ignoreOnStartRespins: boolean;
  get ignoreOnStartRespins(): boolean {
    return this._ignoreOnStartRespins;
  }

  constructor(
    container: Container,
    popupView: EpicWinPopupView,
    configuration: EpicWinConfiguration,
    stopBackgroundSound: boolean,
    startAfterShortWinLines: boolean,
    featureName?: string[],
    ignoreOnStartRespins: boolean = false
  ) {
    super(container, popupView, configuration, stopBackgroundSound, startAfterShortWinLines);
    this._featureName = featureName ?? null;
    this._ignoreOnStartRespins = ignoreOnStartRespins;
  }

  protected initSubscriptions(): void {
    this.lazyAction = new LazyAction(() =>
      this.popupAction(this.gameStateMachineNotifier.gameStateMachine.curResponse)
    );
    this._lazyShortAction = new LazyAction(() =>
      this.popupShortAction(this.gameStateMachineNotifier.gameStateMachine.curResponse)
    );
    this.gameStateMachineNotifier.gameStateMachine.shortWinLines.appendLazyAnimation(
      () => this._lazyShortAction
    );

    this.gameStateMachineNotifier.gameStateMachine.animation.appendLazyAnimation(
      () => this.lazyAction
    );
    this.gameStateMachineNotifier.gameStateMachine.animation.appendLazyAnimation(() =>
      this.getPrepurchaseTurboWinPopup(this.gameStateMachineNotifier.gameStateMachine.curResponse)
    );
  }

  onPopupClosed(): void {
    if (!this.lazyAction.isFinished) {
      this.lazyAction.end();
    }
    if (!this._lazyShortAction.isFinished) {
      this._lazyShortAction.end();
    }
    if (this.view.isShareChecked) {
      this.sharer.shareEpicWin();
    }

    this.view.resetShare();

    super.onPopupClosed();
  }

  onPopupShown(): void {
    super.onPopupShown();

    // if (this.sharer.enabled && this.authorizationHolder.isFacebook) {
    //   this.view.showShareChbx();
    // } else {
    this.view.hideShareChbx();
    // }
  }

  popupShortAction(response: ISpinResponse): Action {
    if (
      (!response.specialSymbolGroups ||
        !this._featureName ||
        !response.specialSymbolGroups.some((g) => g.type && this._featureName!.includes(g.type))) &&
      (!response.isFreeSpins ||
        response.freeSpinsInfo!.event == FreeSpinsInfoConstants.FreeSpinsStarted)
    ) {
      return new EmptyAction();
    }

    if (response.additionalData instanceof InternalRespinSpecGroup) {
      const repinResponse = response.additionalData as InternalRespinSpecGroup;
      if (repinResponse.respinCounter < repinResponse.groups.length && this._ignoreOnStartRespins) {
        return new EmptyAction();
      }
    }

    if (this.isBigWin(response)) {
      const totalWin =
        this.gameStateMachine.curResponse.specialSymbolGroups &&
        this.gameStateMachine.curResponse.specialSymbolGroups.some(
          (g) => g.type == 'bigWinTotalWin'
        )
          ? this.gameStateMachine.curResponse.specialSymbolGroups.find(
              (g) => g.type == 'bigWinTotalWin'
            )!.totalJackPotWin
          : this.gameStateMachine.curResponse.totalWin;
      return new SequenceSimpleAction([
        this.view.showWinAction(this.bigWinName, totalWin),
        new AwaitableAction(this.view.show()),
      ]);
    }
    return new EmptyAction();
  }

  popupAction(response: ISpinResponse): Action {
    if (
      (response.specialSymbolGroups &&
        this._featureName &&
        response.specialSymbolGroups.some((g) => g.type && this._featureName!.includes(g.type))) ||
      (response.isFreeSpins &&
        response.freeSpinsInfo!.event != FreeSpinsInfoConstants.FreeSpinsStarted)
    ) {
      return new EmptyAction();
    }

    if (response.additionalData instanceof InternalRespinSpecGroup) {
      const repinResponse = response.additionalData as InternalRespinSpecGroup;
      if (repinResponse.respinCounter < repinResponse.groups.length && this._ignoreOnStartRespins) {
        return new EmptyAction();
      }
    }

    if (this.isBigWin(response)) {
      const totalWin =
        this.gameStateMachine.curResponse.specialSymbolGroups &&
        this.gameStateMachine.curResponse.specialSymbolGroups.some(
          (g) => g.type == 'bigWinTotalWin'
        )
          ? this.gameStateMachine.curResponse.specialSymbolGroups.find(
              (g) => g.type == 'bigWinTotalWin'
            )!.totalJackPotWin
          : this.gameStateMachine.curResponse.totalWin;
      return new SequenceSimpleAction([
        this.view.showWinAction(this.bigWinName, totalWin),
        new AwaitableAction(this.view.show()),
      ]);
    }
    return new EmptyAction();
  }
}
