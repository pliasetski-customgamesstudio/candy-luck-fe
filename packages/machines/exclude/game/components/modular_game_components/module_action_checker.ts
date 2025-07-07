// import { Container } from 'syd';
// import { ModuleSpinConditions, FreeSpinsInfoConstants } from 'machines/src/reels_engine_library';

// class ModuleSpinMode {
//   static RegularSpins: string = "RegularSpins";
//   static FreeSpins: string = "FreeSpins";
// }

// export interface IModuleActionChecker {
//   isSpinAllowed: boolean;
//   isStopAllowed: boolean;
//   isWinLinesAllowed: boolean;
// }

// class ModuleActionChecker implements IModuleActionChecker {
//   private _spinConditions: ModuleSpinConditions;
//   private _gameStateMachine: GameStateMachine;
//   private _gameEngine: ISlotGameEngine;

//   constructor(container: Container) {
//     this._spinConditions = container.resolve<ISlotGameModule>(ISlotGameModule).moduleSpinConditions;
//     this._gameStateMachine = container.resolve<IGameStateMachineProvider>(IGameStateMachineProvider).gameStateMachine;
//     this._gameEngine = container.resolve<ISlotGameEngineProvider>(ISlotGameEngineProvider).gameEngine;
//   }

//   get isSpinAllowed(): boolean {
//     return (
//       (!this._gameStateMachine.curResponse.freeSpinsInfo ||
//         this._gameStateMachine.curResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsFinished) &&
//       this._spinConditions.spinModes.includes(ModuleSpinMode.RegularSpins)
//     ) ||
//       (
//         this._gameStateMachine.curResponse.freeSpinsInfo &&
//         this._gameStateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsFinished &&
//         this._spinConditions.spinModes.includes(ModuleSpinMode.FreeSpins) &&
//         (!this._spinConditions.freeSpinTypes ||
//           this._spinConditions.freeSpinTypes.includes(this._gameStateMachine.curResponse.freeSpinsInfo.name)) &&
//         (!this._spinConditions.freeSpinParameterValues ||
//           this._spinConditions.freeSpinParameterValues.includes(this._gameStateMachine.curResponse.freeSpinsInfo.parameter))
//       );
//   }

//   get isStopAllowed(): boolean {
//     return !this._gameEngine.isSlotStopped;
//   }

//   get isWinLinesAllowed(): boolean {
//     return (
//       !this._gameStateMachine.curResponse.freeSpinsInfo &&
//       this._spinConditions.spinModes.includes(ModuleSpinMode.RegularSpins)
//     ) ||
//       (
//         this._gameStateMachine.curResponse.freeSpinsInfo &&
//         this._gameStateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted &&
//         this._spinConditions.spinModes.includes(ModuleSpinMode.FreeSpins) &&
//         (!this._spinConditions.freeSpinTypes ||
//           this._spinConditions.freeSpinTypes.includes(this._gameStateMachine.curResponse.freeSpinsInfo.name)) &&
//         (!this._spinConditions.freeSpinParameterValues ||
//           this._spinConditions.freeSpinParameterValues.includes(this._gameStateMachine.curResponse.freeSpinsInfo.parameter))
//       );
//   }
// }
