// import { Container } from 'inversify';
// import { AnticipationAnimationProvider, IntervalAction, EmptyAction, SequenceAction, ConditionIntervalAction, FunctionAction, ParallelAction } from 'machines';
// import { SceneCommon, ResourcesComponent } from '@cgs/syd';
// import { ReelsEngine, IReelsEngineProvider } from '../../../reels_engine_library';
// import { ISlotGameModule, ISlotGameEngineProvider, IGameStateMachineProvider, IGameConfigProvider } from 'common';

// export class ModularNextReelAnticipationAnimationProvider extends AnticipationAnimationProvider {
//   private _moduleId: string;
//   private _modularSlotGame: BaseModularSlotGame;
//   private _module: ISlotGameModule;

//   constructor(container: Container, sceneCommon: SceneCommon, moduleId: string) {
//     super(container, sceneCommon);
//     this._moduleId = moduleId;
//     this._modularSlotGame = container.forceResolve<ISlotGame>(T_ISlotGame) as BaseModularSlotGame;
//     this._module = this._modularSlotGame.modules.find((m) => m.moduleParams.gameId == moduleId);

//     this.reelsEngine = (this._module.getComponent(ISlotGameEngineProvider) as IReelsEngineProvider).reelsEngine;
//     this.gameStateMachine = this._module.getComponent(IGameStateMachineProvider).gameStateMachine;
//     this.spinConfig = this._module.getComponent(IGameConfigProvider).gameConfig.regularSpinConfig;
//     this.anticipationConfig = this._module.getComponent(IGameConfigProvider).gameConfig.anticipationConfig;
//     this.gameResourceProvider = this._module.getComponent(ResourcesComponent);
//     this.reelSoundModel = this._module.getComponent(RegularSpinsSoundModelComponent).regularSpinSoundModel;
//     this.iconModel = this._module.getComponent(IconModelComponent).iconModel;
//   }

//   AnticipationAction(reel: number): IntervalAction {
//     const _response = this.gameStateMachine.curResponse as ModularSpinResponse;
//     if (!_response.moduleReelStates || _response.moduleReelStates.length == 0) {
//       return new EmptyAction();
//     }
//     const _reelStates = _response.moduleReelStates[this._moduleId];
//     if (this.CheckWin(reel)) {
//       for (const symbolId of this.anticipationConfig.anticipationIcons) {
//         if (_reelStates.viewReels[reel].contains(symbolId)) {
//           if (!symbols[symbolId].contains(reel)) {
//             symbols[symbolId].add(reel);
//           }
//         }
//       }

//       const symbolActions: Map<number, IntervalAction> = new Map<number, IntervalAction>();
//       const accelerateActions: IntervalAction[] = [];
//       const iconAnimationActions: IntervalAction[] = [];
//       const fadeReelsProvider = this._module.getComponent(IFadeReelsProvider);

//       let i = 0;
//       symbols.forEach((key, value) => {
//         {
//           const actions: IntervalAction[] = [];

//           if (value.length >= 0 && this.isWinPossible(key, reel + 1)) {
//             for (let r = reel + 1; r < this.reelsEngine.ReelConfig.reelCount; r++) {
//               if (value.length >= this.anticipationConfig.minIconsForAnticipation && !acceleratedReels.contains(r) && this.anticipationConfig.anticipationReels[this.anticipationConfig.anticipationIcons.indexOf(key)].contains(r)) {
//                 accelerateActions.push(this.AccelerateAction(r));
//                 acceleratedReels.add(r);
//               }
//             }

//             if (reel < this.reelsEngine.ReelConfig.reelCount - 1) {
//               const icon = this.iconModel.getStaticIcon(key).first;

//               iconAnimationActions.push(new SequenceAction([
//                 new ConditionIntervalAction(() => this.reelsEngine.isReelDirectionChanged(reel) || this.reelsEngine.isReelStopped(reel)),
//                 new FunctionAction(() => {
//                   icon.stateMachine.switchToState("default");
//                   icon.stateMachine.switchToState("anim");
//                 })]));
//               iconAnimationActions.push(new SequenceAction([
//                 new ConditionIntervalAction(() => this.reelsEngine.isReelDirectionChanged(reel) || this.reelsEngine.isReelStopped(reel)),
//                 this.AccelerationSoundAction()]));
//             }
//             else {
//               const icon = this.iconModel.getStaticIcon(key).first;

//               iconAnimationActions.push(new SequenceAction([
//                 new ConditionIntervalAction(() => this.reelsEngine.isReelDirectionChanged(reel) || this.reelsEngine.isReelStopped(reel)),
//                 new FunctionAction(() => {
//                   icon.stateMachine.switchToState("default");
//                   icon.stateMachine.switchToState("anim");
//                 })]));
//               iconAnimationActions.push(new SequenceAction([
//                 new ConditionIntervalAction(() => this.reelsEngine.isReelDirectionChanged(reel) || this.reelsEngine.isReelStopped(reel)),
//                 this.AccelerationSoundAction()]));
//             }

//             symbolActions.set(key, new ParallelAction(actions));
//           }
//         }
//       });

//       let result: IntervalAction = null;
//       symbols.forEach((key, value) => {
//         if (value.contains(reel) && symbolActions.has(key)) {
//           result = new ParallelAction([this.RemoveAnticipations(reel + 1), new ParallelAction(iconAnimationActions), symbolActions.get(key)]);
//         }
//       });
//       if (result) {
//         return result;
//       }

//       return new ParallelAction([this.RemoveAnticipations(reel + 1),
//       symbolActions.size > 0 ? symbolActions.values[0] : new EmptyAction()]);
//     }

//     return new EmptyAction();
//   }

//   stopAccelerationSound(): void {
//   }

//   RemoveCurrentScene(symbolId: number, reel: number): void {
//     for (let i = 0; i <= reel; i++) {
//       this.reelSoundModel.anticipatorSound(symbolId, 0).GoToState("default");
//     }
//     acceleratedReels = [];
//     const reelAnticipation = this.gameResourceProvider.slot.findById(
//       `anticipation_${symbolId}_${reel}`);
//     const reelAnticipationBg = this.gameResourceProvider.slot.findById(
//       `anticipation_bg_${symbolId}_${reel}`);
//     const children = [...reelAnticipation.childs];
//     reelAnticipation.removeAllChilds();
//     for (const child of children) {
//       child.deinitialize();
//     }

//     if (reelAnticipationBg) {
//       const childrenBg = [...reelAnticipationBg.childs];
//       reelAnticipationBg.removeAllChilds();
//       for (const child of childrenBg) {
//         child.deinitialize();
//       }
//     }
//   }

//   RemoveScene(symbolId: number): void {
//     acceleratedReels = [];
//     const icon = this.iconModel.getStaticIcon(symbolId).first;
//     icon.stateMachine.switchToState("default");

//     for (let reel = 0; reel < this.reelsEngine.ReelConfig.reelCount; reel++) {
//       const reelAnticipation = this.gameResourceProvider.slot.findById(`anticipation_${symbolId}_${reel}`);
//       const reelAnticipationBg = this.gameResourceProvider.slot.findById(`anticipation_bg_${symbolId}_${reel}`);
//       const children = [...reelAnticipation.childs];
//       reelAnticipation.removeAllChilds();
//       for (const child of children) {
//         child.deinitialize();
//       }

//       if (reelAnticipationBg) {
//         const childrenBg = [...reelAnticipationBg.childs];
//         reelAnticipationBg.removeAllChilds();
//         for (const child of childrenBg) {
//           child.deinitialize();
//         }
//       }
//     }
//   }
// }
