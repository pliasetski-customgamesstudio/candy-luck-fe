// import { ReelsEngine } from 'machines';
// import { Syd } from '@cgs/syd';
// import { Shared } from 'shared';
// import { ReelWinPosition, Line, AnticipationAnimationProvider, ISlotGameModule, AnticipationConfig, GameStateMachine, ISpinResponse, IGameConfigProvider, IReelsEngineProvider, IGameStateMachineProvider } from '../../../reels_engine_library';
// import { EmptyAction, IntervalAction, SequenceAction, WaitForAction, FunctionAction } from 'common';

// export class ModularStopWithAnticipationAction extends BuildAction {
//   private _reelsEngine: ReelsEngine;
//   private _winTapes: number[][];
//   private _winLines: Line[];
//   private _winPositions: ReelWinPosition[];
//   private _spinStopDelay: number;
//   private _reelSounds: ReelsSoundModel;
//   private _anticipationAnimationProvider: AnticipationAnimationProvider;
//   private _container: ISlotGameModule;
//   private _stopReelsSoundImmediately: boolean;
//   private _anticipationConfig: AnticipationConfig;
//   private readonly _useSounds: boolean;
//   private _stateMachine: GameStateMachine<ISpinResponse>;

//   constructor(container: ISlotGameModule, winTapes: number[][], winLines: Line[], winPositions: ReelWinPosition[], spinStopDelay: number, reelSounds: ReelsSoundModel, stopReelsSoundImmediately: boolean, useSounds: boolean) {
//     super();
//     this._container = container;
//     this._winTapes = winTapes;
//     this._winLines = winLines;
//     this._winPositions = winPositions;
//     this._spinStopDelay = spinStopDelay;
//     this._reelSounds = reelSounds;
//     this._stopReelsSoundImmediately = stopReelsSoundImmediately;
//     this._useSounds = useSounds;
//     this._reelsEngine = (this._container.getComponent(IReelsEngineProvider) as IReelsEngineProvider).reelsEngine;
//     this._anticipationConfig = this._container.getComponent(IGameConfigProvider).gameConfig.anticipationConfig;
//     this._anticipationAnimationProvider = this._container.getComponent(AnticipationAnimationProvider);
//     this._stateMachine = this._container.getComponent(IGameStateMachineProvider).gameStateMachine;

//     if (!this._winLines) {
//       this._winLines = [];
//     }
//   }

//   buildAction(): IntervalAction {
//     this._reelsEngine.slotsStoped.first.then((s) => this._onSlotStopped(s));
//     const actions: IntervalAction[] = [];

//     if (this._stateMachine.curResponse.isFakeResponse) {
//       for (let reel = 0; reel < this._reelsEngine.internalConfig.reelCount; ++reel) {
//         actions.push(new EmptyAction().withDuration(this._spinStopDelay));
//         actions.push(this._stop(reel, this._winTapes[reel]));
//       }
//       return new SequenceAction(actions);
//     }

//     for (let reel = 0; reel < this._reelsEngine.internalConfig.reelCount; ++reel) {
//       actions.push(new EmptyAction().withDuration(this._spinStopDelay));
//       actions.push(this._stop(reel, this._winTapes[reel]));
//       actions.push(this._anticipationAnimationProvider.AnticipationAction(reel));
//     }
//     actions.push(new WaitForAction(this._reelsEngine.slotsStoped).subscribe());
//     actions.push(new FunctionAction(() => {
//       for (let i = 0; i < this._anticipationConfig.anticipationIcons.length; i++) {
//         const symbolId = this._anticipationConfig.anticipationIcons[i];
//         for (const reel of this._anticipationConfig.anticipationReels[i]) {
//           this._reelSounds.anticipatorSound(symbolId, reel).GoToState("default");
//         }
//       }
//     }));
//     return new SequenceAction(actions);
//   }

//   private _stop(reel: number, winTapes: number[]): IntervalAction {
//     return new FunctionAction(() => this._reelsEngine.stop(reel, winTapes));
//   }

//   private _onSlotStopped(o: any): void {
//     if (this._useSounds) {
//       if (this._stopReelsSoundImmediately || this._winLines.length > 0 || (this._winPositions && this._winPositions.length > 0)) {
//         this._reelSounds.startSpinSound.GoToState("stop_sound");
//       } else {
//         this._reelSounds.startSpinSound.GoToState("fade_out");
//       }
//     }

//     this._anticipationAnimationProvider.ClearSymbols();
//     this._anticipationAnimationProvider.stopAccelerationSound();
//   }
// }
