// import { Container } from 'machines';
// import { Syd } from '@cgs/syd';
// import { ReelsEngineLibrary } from '../../../reels_engine_library';
// import { Common } from 'common';

// export class ModularAnticipationStopSlotActionProvider implements IStopSlotActionProvider {
//   private _container: Container;
//   private _regularSpinSoundModel: ReelsSoundModel;
//   private _stateMachine: GameStateMachine<ISpinResponse>;
//   private _config: AbstractGameConfig;
//   private readonly _stopReelsSoundImmediately: boolean;
//   private readonly _useSounds: boolean;
//   private _moduleId: string;
//   private _modularSlotGame: BaseModularSlotGame;
//   private _module: ISlotGameModule;

//   constructor(container: Container, stopReelsSoundImmediately: boolean, moduleId: string, useSounds: boolean = true) {
//     this._container = container;
//     this._stopReelsSoundImmediately = stopReelsSoundImmediately;
//     this._moduleId = moduleId;
//     this._useSounds = useSounds;

//     this._modularSlotGame = this._container.forceResolve<ISlotGame>(T_ISlotGame) as BaseModularSlotGame;
//     this._module = this._modularSlotGame.modules.find((m) => m.moduleParams.gameId == this._moduleId) || null;

//     this._regularSpinSoundModel = this._module.getComponent(RegularSpinsSoundModelComponent).regularSpinSoundModel;
//     this._stateMachine = this._module.getComponent(IGameStateMachineProvider).gameStateMachine;
//     this._config = this._module.getComponent(IGameConfigProvider).gameConfig;
//   }

//   getStopSlotAction(spinMode: SpinMode): Action {
//     const response = this._stateMachine.curResponse as ModularSpinResponse;
//     if (response) {
//       let currentModuleResponse: ReelState = null;
//       currentModuleResponse = response.moduleReelStates[this._moduleId];
//       if (currentModuleResponse) {
//         return new ModularStopWithAnticipationAction(
//             this._module,
//             currentModuleResponse.viewReels,
//             currentModuleResponse.winLines,
//             currentModuleResponse.winPositions,
//             this._config.regularSpinConfig.spinStopDelay,
//             this._regularSpinSoundModel,
//             this._stopReelsSoundImmediately,
//             this._useSounds);
//       }
//     }
//     return new ModularStopWithAnticipationAction(
//         this._module,
//         this._stateMachine.curResponse.viewReels,
//         this._stateMachine.curResponse.winLines,
//         this._stateMachine.curResponse.winPositions,
//         this._config.regularSpinConfig.spinStopDelay,
//         this._regularSpinSoundModel,
//         this._stopReelsSoundImmediately,
//         this._useSounds);
//   }
// }
