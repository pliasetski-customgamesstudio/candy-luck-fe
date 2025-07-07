// import { ISpinResponse, InternalCollapsingSpecGroup, InternalRespinSpecGroup } from "@cgs/common";
// import { Container } from "@cgs/syd";
// import { WinTextController } from '../../../common/footer/controllers/win_text_controller';
// import { SlotSessionProperties } from '../../../common/slot_session';
// import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
// import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
// import { IFeatureWinHolder } from "./i_feature_win_holder";

// export class WinTextControllerWithDynamicWin extends WinTextController {
//   private _featureWinHolder: IFeatureWinHolder;
//   public get featureWinHolder(): IFeatureWinHolder {
//     return this._featureWinHolder;
//   }

//   constructor(container: Container, waysCount: number = 0, isMatch3Game: boolean = false) {
//     super(container, waysCount, isMatch3Game);
//     this._featureWinHolder = container.resolve(IFeatureWinHolder);
//   }

//   public currentAvailableWin(response: ISpinResponse): number {
//     if (!this._featureWinHolder.hasFeatureWin)
//       return this.stateMachine.curResponse.totalWin;
//     return this.stateMachine.curResponse.totalWin - this._featureWinHolder.getCurrentFeatureWin();
//   }

//   public getCurrentAvaliableFSTotalWin(response: ISpinResponse): number {
//     if (!this.stateMachine.curResponse.isFreeSpins)
//       return 0.0;

//     if (!this._featureWinHolder.hasFeatureWin)
//       return (this.stateMachine.curResponse.freeSpinsInfo.totalWin ?? 0.0);
//     return (this.stateMachine.curResponse.freeSpinsInfo.totalWin ?? 0.0) - this._featureWinHolder.getCurrentFeatureWin();
//   }

//   public SessionPropertyChanged(property: SlotSessionProperties): void {
//     switch (property) {
//       case SlotSessionProperties.TotalWin:
//         this.setTotalWin(session.totalWin);
//         break;
//       case SlotSessionProperties.AddTotalWin:
//         this.addTotalWin(session.totalWin, session.currentWin);
//         break;
//       case SlotSessionProperties.AddCurrentWin:
//         this.addCurrentWin(session.totalWin, session.currentWin);
//         break;
//       case SlotSessionProperties.Lines:
//         this.setLinesWays();
//         break;
//     }
//   }

//   private setTotalWin(totalWin: number): void {
//     view.SetTotalWin(totalWin);
//   }

//   private resetWinState(): void {
//     view.ResetWinState();
//   }

//   private stopActionsOnAccelerate(): void {
//     view.StopActionsOnAccelerate();
//   }

//   private addTotalWin(totalWin: number, currentWin: number): void {
//     view.AddTotalWin(totalWin, currentWin);
//   }

//   private addCurrentWin(totalWin: number, currentWin: number): void {
//     view.AddCurrentWin(totalWin, currentWin);
//   }

//   public OnStateExited(slotState: string): void {
//     switch (slotState) {
//       case GameStateMachineStates.Scatter:
//         if (this.stateMachine.curResponse.isFreeSpins &&
//           this.stateMachine.curResponse.freeSpinsInfo.event ==
//           FreeSpinsInfoConstants.FreeSpinsStarted && (!this.stateMachine.prevResponse || !this.stateMachine.prevResponse.isFreeSpins || this.stateMachine.prevResponse.freeSpinsInfo.event ==
//             FreeSpinsInfoConstants.FreeSpinsFinished)) {
//           this.stopActionsOnAccelerate();
//           session.SetTotalWin(0);
//         }
//         break;
//       case GameStateMachineStates.FreeSpinRecovery:
//         this.stopActionsOnAccelerate();
//         break;
//       case GameStateMachineStates.Bonus:
//         if (this.stateMachine.curResponse.isFreeSpins) {
//           session.AddTotalWin(this.stateMachine.curResponse.freeSpinsInfo.totalWin,
//             this.stateMachine.curResponse.totalWin);
//         }
//         else {
//           session.SetTotalWin(this.stateMachine.curResponse.totalWin);
//         }
//         break;
//       case GameStateMachineStates.BeginFreeSpinsPopup:
//         if (session.GameId != "78" && session.GameId != "122" && this.stateMachine.curResponse.isFreeSpins && this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//           session.SetTotalWin(0);
//         }

//         this.resetWinState();
//         break;
//     }
//   }

//   public OnStateEntered(slotState: string): void {
//     switch (slotState) {
//       case GameStateMachineStates.BeginCollapse:
//         const group: InternalCollapsingSpecGroup = this.stateMachine.curResponse.additionalData;
//         if (group) {
//           if (!this.stateMachine.curResponse.isFreeSpins || this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//             const totalWin = group.groups.slice(0, group.collapsingCounter + 1).reduce(
//               (win, gr) => win + gr.roundWin, 0);
//             session.SetTotalWin(totalWin);
//           }
//           else {
//             let roundWin = 0.0;
//             group.groups.slice(group.collapsingCounter + 1).forEach((round) => roundWin += round.roundWin);
//             const totalWin = this.stateMachine.curResponse.freeSpinsInfo.totalWin - roundWin;
//             const currentWin = group.groups[group.collapsingCounter].roundWin;
//             session.AddTotalWin(totalWin, currentWin);
//           }
//         }
//         break;
//       case GameStateMachineStates.ShortWinLines:
//         if (this.stateMachine.curResponse) {
//           const respinGroup = this.stateMachine.curResponse.additionalData
//             && this.stateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
//             ? this.stateMachine.curResponse.additionalData as InternalRespinSpecGroup
//             : null;

//           if (respinGroup && !respinGroup.respinStarted) {
//             if (!respinGroup.respinStarted) {
//               if (!this.stateMachine.curResponse.isFreeSpins || this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//                 session.SetTotalWin(respinGroup.firstWin);
//               }
//               else {
//                 let roundWin = 0.0;
//                 respinGroup.groups.slice(respinGroup.respinCounter).forEach((round) => roundWin += round.roundWin);
//                 const totalWin = this.stateMachine.curResponse.freeSpinsInfo.totalWin - roundWin;
//                 session.AddTotalWin(totalWin, respinGroup.firstWin);
//               }
//             } else if (respinGroup.respinCounter < respinGroup.groups.length) {
//               session.SetTotalWin(respinGroup.currentRound.roundWin);
//             }
//           }

//           const collapsingGroup = this.stateMachine.curResponse.additionalData
//             && this.stateMachine.curResponse.additionalData instanceof InternalCollapsingSpecGroup
//             ? this.stateMachine.curResponse.additionalData as InternalCollapsingSpecGroup
//             : null;
//           if (collapsingGroup) {
//             if (collapsingGroup.collapsingCounter === collapsingGroup.groups.length) {
//               if (!this.stateMachine.curResponse.isFreeSpins || this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//                 session.SetTotalWin(this.stateMachine.curResponse.totalWin);
//               }
//             } else {
//               if (!this.stateMachine.curResponse.isFreeSpins || this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted) {
//                 session.SetTotalWin(collapsingGroup.currentRound.roundWin);
//               }
//             }
//             return;
//           }

//           if ((!respinGroup) || (respinGroup.respinStarted && respinGroup.respinCounter === respinGroup.groups.length && !respinShowWinProvider)) {
//             if (this.stateMachine.curResponse.isFreeSpins && this.stateMachine.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted) {
//               if (this._featureWinHolder.hasFeatureWin) {
//                 const reducedTotalWin = this._featureWinHolder.getCurrentFeatureWin();
//                 session.AddCurrentWin(this.stateMachine.curResponse.freeSpinsInfo.totalWin - this.stateMachine.curResponse.totalWin, this.stateMachine.curResponse.totalWin - reducedTotalWin);
//               }
//               else {
//                 session.AddTotalWin(this.stateMachine.curResponse.freeSpinsInfo.totalWin, this.stateMachine.curResponse.totalWin);
//               }
//             }
//             else {
//               if (this._featureWinHolder.hasFeatureWin) {
//                 const reducedTotalWin = this._featureWinHolder.getCurrentFeatureWin();
//                 session.SetTotalWin(this.stateMachine.curResponse.totalWin - reducedTotalWin);
//               }
//               else {
//                 session.SetTotalWin(this.stateMachine.curResponse.totalWin);
//               }
//             }
//           }
//         }
//         break;
//       case GameStateMachineStates.Respin:
//         if (respinShowWinProvider) {
//           if (this.stateMachine.curResponse) {
//             const respinGroup = this.stateMachine.curResponse.additionalData
//               && this.stateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
//               ? this.stateMachine.curResponse.additionalData as InternalRespinSpecGroup
//               : null;

//             if (respinGroup) {
//               if (!respinGroup.respinStarted) {
//                 session.SetTotalWin(respinGroup.firstWin);
//               } else if (respinGroup.respinCounter < respinGroup.groups.length) {
//                 session.SetTotalWin(respinGroup.groups[respinGroup.respinCounter - 1].roundWin);
//               }
//             }
//           }
//         }
//         break;
//       case GameStateMachineStates.RegularSpin:
//         if (this.stateMachine.curResponse && hudCoordinator.updateTotalWinOnRegularSpins) {
//           if (!this.stateMachine.curResponse.isFreeSpins) {
//             session.SetTotalWin(this.stateMachine.curResponse.totalWin);
//           }
//         }
//         break;
//       case GameStateMachineStates.EndOfFreeSpins:
//         const group = this.stateMachine.curResponse.additionalData instanceof InternalCollapsingSpecGroup ? this.stateMachine.curResponse.additionalData as InternalCollapsingSpecGroup : null;
//         if (!group) {
//           if (this.stateMachine.curResponse.freeSpinsInfo) {
//             session.AddTotalWin(this.stateMachine.curResponse.freeSpinsInfo.totalWin, this.stateMachine.curResponse.totalWin);
//           }
//         }
//         break;
//       case GameStateMachineStates.FreeSpinRecovery:
//         session.SetTotalWin(this.stateMachine.curResponse.freeSpinsInfo.totalWin);
//         break;
//       case GameStateMachineStates.BeginBonus:
//       case GameStateMachineStates.BeginFreeSpins:
//       case GameStateMachineStates.BeginScatter:
//         if (this.stateMachine.curResponse.isFreeSpins && this.stateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
//           session.AddTotalWin(this.stateMachine.curResponse.freeSpinsInfo.totalWin, this.stateMachine.curResponse.totalWin);
//         }
//         else {
//           if (this.stateMachine.curResponse &&
//             !hudCoordinator.updateTotalWinAfterScatter) {
//             if (this.stateMachine.curResponse.isFreeSpins && this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted &&
//               this.stateMachine.curResponse.freeSpinReBuyInfo) {
//               session.SetTotalWin(0);
//             }
//             else {
//               session.SetTotalWin(this.stateMachine.curResponse.totalWin);
//             }
//           }
//         }
//         break;
//       case GameStateMachineStates.Accelerate:
//         if (this.stateMachine.curResponse.isFreeSpins && !this.stateMachine.curResponse.isRespin && this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsFinished) {
//           session.SetTotalWin(0);
//         }
//         else if (!this.stateMachine.curResponse.isRespin && this.stateMachine.curResponse.isFreeSpins && this.stateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsFinished) {
//           this.resetWinState();
//         }
//         this.stopActionsOnAccelerate();
//         break;
//       case GameStateMachineStates.WaitAccelerationComplete:
//         this.stopActionsOnAccelerate();
//         if (!this.stateMachine.curResponse.isRespin && (!this.stateMachine.curResponse.isFreeSpins || this.stateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted)) {
//           session.SetTotalWin(0);
//         }
//         else {
//           this.resetWinState();
//         }
//         break;
//     }
//   }
// }
