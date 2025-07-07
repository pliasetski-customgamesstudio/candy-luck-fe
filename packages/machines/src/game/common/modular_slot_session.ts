// import { Container, View } from "@cgs/syd";
// import { BaseModularSlotGame } from '../base_modular_slot_game';
// import { SlotSession } from "./slot_session";

// export class ModularSlotSession extends SlotSession {
//   private _modularSlotGame: BaseModularSlotGame;
//   private modularMachineInfo: IModularSlotMachineInfo;

//   get maxLinesWithModules(): number {
//     return this.lines;
//   }

//   constructor(container: Container, machineInfo: IModularSlotMachineInfo, gameView: View, gameId: string) {
//     super(container, machineInfo, gameView, gameId);
//     this._modularSlotGame = container.forceResolve<ISlotGame>(T_ISlotGame);
//     this.modularMachineInfo = machineInfo;
//   }

//   Init(): void {
//     super.Init();

//     this.gameStateMachine.beginFreeSpinsPopup.leaved.subscribe((e) => {
//       this.updateTotalBet();
//       this.propertyChangedController.dispatchEvent(SlotSessionProperties.Bet);
//     });

//     this.gameStateMachine.endFreeSpinsPopup.leaved.subscribe((e) => {
//       this.updateTotalBet();
//       this.propertyChangedController.dispatchEvent(SlotSessionProperties.Bet);
//     });
//   }

//   updateTotalBet(): void {
//     if (!this.bet || !this.lines) return;

//     if (this.modularMachineInfo) {
//       this.TotalBet = this.bet.bet * this.maxLinesWithModules;
//       this.propertyChangedController.dispatchEvent(SlotSessionProperties.TotalBet);
//     } else {
//       super.updateTotalBet();
//     }
//   }

//   async setMaxAvailableBet(): Promise<boolean> {
//     const availableBets = this.machineInfo.bets.filter((b) => b.bet * this.maxLinesWithModules <= this.userInfoHolder.user.balance);
//     if (availableBets.length > 0) {
//       await this.SetBet(this.getMaxBet());
//       return true;
//     }
//     return false;
//   }
// }
