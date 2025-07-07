// import { ISpinResponse, InternalRespinSpecGroup, InternalCollapsingSpecGroup } from "@cgs/common";
// import { Container } from "@cgs/syd";
// import { SlotSession } from '../../../common/slot_session';
// import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
// import { IFeatureWinHolder } from "./i_feature_win_holder";

// export class TotalWinWithDynamicWinMachineListener extends TotalWinMachineListener {
//   private _featureWinHolder: IFeatureWinHolder;

//   constructor(container: Container, totalWinController: SlotSession) {
//     super(container, totalWinController);
//     this._featureWinHolder = container.resolve(IFeatureWinHolder);
//   }

//   public currentAvailableWin(response: ISpinResponse): number {
//     if (!this._featureWinHolder.hasFeatureWin) {
//       return response.totalWin;
//     }
//     return response.totalWin - this._featureWinHolder.getCurrentFeatureWin();
//   }

//   public getCurrentAvaliableFSTotalWin(response: ISpinResponse): number {
//     if (!response.isFreeSpins) {
//       return 0.0;
//     }

//     if (!this._featureWinHolder.hasFeatureWin) {
//       return (response.freeSpinsInfo.totalWin ?? 0.0);
//     }
//     return (response.freeSpinsInfo.totalWin ?? 0.0) - this._featureWinHolder.getCurrentFeatureWin();
//   }

//   public onShortWinLinesEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     const respinGroup = stateMachine.curResponse.additionalData as InternalRespinSpecGroup;

//     if (respinGroup && !respinGroup.respinStarted) {
//       if (!respinGroup.respinStarted) {
//         if (!current.isFreeSpins || current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//           _totalWinController.SetTotalWin(respinGroup.firstWin);
//         }
//         else {
//           const totalWin = current.freeSpinsInfo.totalWin - Enumerable.sum(Enumerable.skip(respinGroup.groups, respinGroup.respinCounter), (round) => round.roundWin);
//           _totalWinController.AddTotalWin(totalWin, respinGroup.firstWin);
//         }
//       }
//       else if (respinGroup.respinCounter < respinGroup.groups.length) {
//         if (!current.isFreeSpins || current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//           _totalWinController.SetTotalWin(respinGroup.currentRound.roundWin);
//         }
//       }
//     }

//     const collapsingGroup = current.additionalData as InternalCollapsingSpecGroup;
//     if (collapsingGroup) {
//       if (collapsingGroup.collapsingCounter == collapsingGroup.groups.length) {
//         if (!current.isFreeSpins || current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//           _totalWinController.SetTotalWin(currentAvailableWin(current));
//         }
//       }
//       else {
//         if (!current.isFreeSpins || current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//           _totalWinController.SetTotalWin(collapsingGroup.currentRound.roundWin);
//         }

//       }
//       return;
//     }

//     if ((!respinGroup) || (respinGroup.respinStarted && respinGroup.respinCounter == respinGroup.groups.length && !_respinShowWinProvider)) {
//       if (current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
//         if (_featureWinHolder.hasFeatureWin) {
//           const reducedTotalWin = _featureWinHolder.getCurrentFeatureWin();
//           _totalWinController.AddCurrentWin(current.freeSpinsInfo.totalWin - current.totalWin, current.totalWin - reducedTotalWin);
//         }
//         else {
//           _totalWinController.AddTotalWin(current.freeSpinsInfo.totalWin, current.totalWin);
//         }
//       }
//       else {
//         if (_featureWinHolder.hasFeatureWin) {
//           const reducedTotalWin = _featureWinHolder.getCurrentFeatureWin();
//           _totalWinController.SetTotalWin(current.totalWin - reducedTotalWin);
//         }
//         else {
//           _totalWinController.SetTotalWin(current.totalWin);
//         }
//       }
//     }
//   }

//   public onWaitAccelerationCompleteExited(current: ISpinResponse, previous: ISpinResponse): void {
//     _totalWinController.stopActionsOnAccelerate();
//     if (!current.isRespin && (!current.isFreeSpins || current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted)) {
//       _totalWinController.hideView();
//       /*if (current.IsFreeSpins && current.FreeSpinsInfo.Event != FreeSpinsInfoConstants.FreeSpinsFinished)
//       {
//           _totalWinController.ResetWinState();
//       }*/
//     }
//     else {
//       _totalWinController.resetWinState();
//     }
//   }

//   public onBeginFreeSpinsEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     if (current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {

//       _totalWinController.AddTotalWin(getCurrentAvaliableFSTotalWin(current), currentAvailableWin(current));
//     }
//     else {
//       if (current.isFreeSpins && current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted &&
//         current.freeSpinReBuyInfo) {
//         _totalWinController.hideView();
//       }
//       else {
//         _totalWinController.SetTotalWin(currentAvailableWin(current));
//       }
//     }
//   }

//   public onFreeSpinRecoveryEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     _totalWinController.SetTotalWin(getCurrentAvaliableFSTotalWin(current));
//     _totalWinController.stopActionsOnAccelerate();
//   }

//   public onBeginBonusEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     if (current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
//       _totalWinController.AddTotalWin(getCurrentAvaliableFSTotalWin(current), currentAvailableWin(current));
//     }
//     else {
//       _totalWinController.SetTotalWin(currentAvailableWin(current));
//     }
//   }

//   public onBonusExited(current: ISpinResponse, previous: ISpinResponse): void {
//     if (current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
//       _totalWinController.AddTotalWin(getCurrentAvaliableFSTotalWin(current), currentAvailableWin(current));
//     }
//     else {
//       _totalWinController.SetTotalWin(currentAvailableWin(current));
//     }
//   }

//   public onBonusRecoveryEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     if (current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
//       _totalWinController.SetTotalWin(getCurrentAvaliableFSTotalWin(current));
//     }
//   }

//   public onBeginScatterEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     if (current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
//       _totalWinController.AddTotalWin(getCurrentAvaliableFSTotalWin(current), currentAvailableWin(current));
//     }
//     else {
//       _totalWinController.SetTotalWin(currentAvailableWin(current));
//     }
//   }

//   public onScatterExited(current: ISpinResponse, previous: ISpinResponse): void {
//     if (_stateMachine.curResponse.isFreeSpins && _stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted && (!_stateMachine.previousResponse || !_stateMachine.previousResponse.isFreeSpins || _stateMachine.previousResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsFinished)) {
//       _totalWinController.stopActionsOnAccelerate();
//       _totalWinController.hideView();
//     }
//   }

//   public onAccelerateExited(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     _totalWinController.stopActionsOnAccelerate();
//   }

//   public onRegularSpinsEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     if (!current.isFreeSpins) {
//       _totalWinController.SetTotalWin(current.totalWin);
//     }
//   }

//   public onEndOfFreeSpinsEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     _totalWinController.AddTotalWin(getCurrentAvaliableFSTotalWin(currentResponse), currentAvailableWin(currentResponse));
//   }

//   public onAccelerateEntered(current: ISpinResponse, previous: ISpinResponse): void {
//     if (current.isFreeSpins && !current.isRespin && current.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsFinished) {
//       _totalWinController.hideView();
//     }
//     else if (current.isRespin && current.isFreeSpins && current.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsFinished) {
//       _totalWinController.resetWinState();
//     }
//   }

//   public onFreeSpinEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     if (currentResponse.isFreeSpins &&
//       currentResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//       _totalWinController.hideView();
//       _totalWinController.resetWinState();
//     }
//   }
// }
