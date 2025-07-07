// import { IGameStateMachineProvider, IGameConfigProvider, IconEnumeratorComponent, ISlotGameEngineProvider, IReelsEngineProvider, IWinLineActionProvider, RegularSpinsSoundModelComponent } from 'machines';
// import { Container } from '@cgs/syd';
// import { CollapseGameConfig, CollapseReelsEngine, IconAnimationHelper, ReelsSoundModel, CollapseGameStateMachine, ISpinResponse, InternalCollapsingSpecGroup, Line } from '../../../reels_engine_library';
// import { ListSet } from 'common';

// export class CollapseAnimationComponent {
//   private _gameConfig: CollapseGameConfig;
//   private _reelsEngine: CollapseReelsEngine;
//   private _iconEnumerator: IconEnumeratorComponent;
//   private _iconAnimationHelper: IconAnimationHelper;
//   private _reelSoundModel: ReelsSoundModel;
//   private _gameStateMachine: CollapseGameStateMachine;
//   private _container: Container;
//   private _playBangSound: boolean;
//   private _playCollapseSound: boolean;

//   constructor(container: Container, playBangSound: boolean, playCollapseSound: boolean) {
//     this._container = container;
//     this._playBangSound = playBangSound;
//     this._playCollapseSound = playCollapseSound;

//     const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine;
//     this._gameStateMachine = gameStateMachine;
//     this._gameConfig = this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
//     this._iconEnumerator = this._container.resolve(IconEnumeratorComponent).iconsEnumerator;
//     this._reelsEngine = (this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider) as IReelsEngineProvider).reelsEngine;
//     this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
//     this._reelSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(T_RegularSpinsSoundModelComponent).regularSpinSoundModel;

//     gameStateMachine.collapseState.appendLazyAnimation(() => new SequenceSimpleAction([
//       this.bangAction(gameStateMachine.curResponse.winLines),
//       this.collapseAction(gameStateMachine.curResponse),
//       new ConditionIntervalAction(this._reelsEngine.SlotCollapsed).withDuration(-1.0)
//     ]));
//   }

//   private bangAction(winLines: Line[]): IntervalAction {
//     const positions = this._getWinLinePositions(winLines);
//     const winLineActionProvider = this._container.resolve(IWinLineActionProvider);
//     winLineActionProvider.createActions(winLines[0]);

//     const bangActions: IntervalAction[] = [];
//     const delayActions: IntervalAction[] = [];
//     const hideActions: IntervalAction[] = [];

//     if (this._playBangSound) {
//       let soundAction = winLineActionProvider.winLineRegularSoundAction;
//       if (!soundAction) {
//         soundAction = winLineActionProvider.winLineWildSoundAction;
//       }
//       if (!soundAction) {
//         const bagSound = this._reelSoundModel.getSoundByName("bang");
//         soundAction = new SequenceAction([
//           new StopSoundAction(bagSound),
//           new PlaySoundAction(bagSound)
//         ]);
//       }

//       delayActions.push(soundAction);
//     }

//     for (const position of positions) {
//       bangActions.push(new FunctionAction(() => this._iconAnimationHelper.startAnimOnIcon(position, "collapse"), false));
//       delayActions.push(new EmptyAction().withDuration(this._iconAnimationHelper.getMaxAnimDuration(position, "collapse")));
//       hideActions.push(new FunctionAction(() => {
//         const line = this._iconAnimationHelper.getLineIndex(position);
//         const reel = this._iconAnimationHelper.getReelIndex(position);

//         let entities = this._reelsEngine.entityCacheHolder.getAnimationEntities(reel, line, false);
//         entities.forEach((e) => this._reelsEngine.hideAnimEntity(e));

//         entities = this._reelsEngine.entityCacheHolder.getSoundEntities(reel, line, false);
//         entities.forEach((e) => this._reelsEngine.hideSoundEntity(e));

//         entities = this._iconAnimationHelper.getEntities(position);
//         const entitiesCopy: Entity[] = [];
//         entities.forEach((e) => {
//           entitiesCopy.push(e);
//           this._iconAnimationHelper.stopAnimOnEntity(e, "collapse");
//         });

//         for (const entity of entitiesCopy) {
//           this._reelsEngine.entityCacheHolder.removeEntity(reel, line, entity);
//         }
//       }));
//     }

//     return new SequenceAction([
//       new ParallelAction(bangActions),
//       new ParallelAction(delayActions),
//       new ParallelAction(hideActions)
//     ]);
//   }

//   private collapseAction(response: ISpinResponse): IntervalAction {
//     const group: InternalCollapsingSpecGroup = response.additionalData;
//     if (group) {
//       const actions: IntervalAction[] = [];
//       const bangPositions = response.winLines.length > 0 ? this._getWinLinePositions(response.winLines) : this._getWinLinePositions(group.currentRound.winLines);
//       const fallAction = new FunctionAction(() => this.fallDownCurrentReels(bangPositions));
//       const fallDownAction = new FunctionAction(() => this.fallDownNewReels(group.currentRound.positions, group.currentRound.newReels));
//       response.winLines = group.currentRound.winLines;
//       if (!group.currentRound.winLines) {
//         response.winLines = [];
//       }

//       if (this._playCollapseSound) {
//         const bagSound = this._reelSoundModel.getSoundByName("collapse");
//         actions.push(new SequenceAction([
//           new StopSoundAction(bagSound),
//           new PlaySoundAction(bagSound)
//         ]));
//       }

//       actions.push(new SequenceAction([fallAction, fallDownAction]));
//       actions.push(new FunctionAction(() => group.collapsingCounter++));
//       actions.push(new EmptyAction().withDuration(this._gameConfig.regularSpinCollapsingConfig.collapsingParameters.roundFallingStartDelay));
//       return new SequenceAction(actions);
//     }

//     return new EmptyAction();
//   }

//   private _getWinLinePositions(winLines: Line[]): number[] {
//     const positions = new ListSet<number>();
//     winLines.forEach((l) => l.iconsIndexes.forEach((i) => positions.add(i)));
//     return positions.list.toList();
//   }

//   private fallDownNewReels(positions: number[], newReels: number[]): void {
//     for (let i = this._reelsEngine.ReelConfig.lineCount - 1; i >= 0; i--) {
//       for (let j = 0; j < this._reelsEngine.ReelConfig.reelCount; j++) {
//         const position = (i * this._reelsEngine.ReelConfig.reelCount) + j;
//         if (positions.includes(position)) {
//           const drawIndex = newReels[positions.indexOf(position)];
//           const reel = this._iconAnimationHelper.getReelIndex(position);
//           const line = this._iconAnimationHelper.getLineIndex(position);
//           let entity = this._reelsEngine.hiddenAnimationEntities[reel].last;
//           this._reelsEngine.hiddenAnimationEntities[reel].remove(entity);
//           entity = this._reelsEngine.hiddenSoundEntities[reel].last;
//           this._reelsEngine.hiddenSoundEntities[reel].remove(entity);
//           this.fallDownEntity(entity, reel, line, drawIndex);
//         }
//       }
//     }

//     this._reelsEngine.initHiddenEntities();
//   }

//   private fallDownCurrentReels(bangPositions: number[]): void {
//     for (let i = 0; i < this._reelsEngine.internalConfig.reelCount; i++) {
//       let fallCounter = 0;
//       for (let j = this._reelsEngine.internalConfig.lineCount - 1; j >= 0; j--) {
//         const reelIndex = i;
//         const lineIndex = j;
//         const position = lineIndex * this._reelsEngine.internalConfig.reelCount + reelIndex;
//         if (bangPositions.includes(position)) {
//           fallCounter++;
//         } else if (fallCounter > 0) {
//           const entities = this._reelsEngine.entityCacheHolder.getAnimationEntities(reelIndex, lineIndex, false);

//           entities.forEach((entity) => {
//             const drawIndex = entity.get(this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex));
//             this.fallDownEntity(entity, reelIndex, lineIndex + fallCounter, drawIndex);
//           });

//           const entitiesCopy: Entity[] = [];
//           entities.forEach((entity) => {
//             entitiesCopy.push(entity);
//           });

//           for (const entity of entitiesCopy) {
//             this._reelsEngine.entityCacheHolder.removeEntity(reelIndex, lineIndex, entity);
//             this._reelsEngine.entityCacheHolder.replaceEntities(reelIndex, lineIndex + fallCounter, [entity]);
//           }
//         }
//       }
//     }
//   }

//   private fallDownEntity(entity: Entity, reel: number, line: number, drawIndex: number): void {
//     entity.set(this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex), drawIndex);
//     this._iconEnumerator.setWinIndex(reel, line, drawIndex);
//     this._reelsEngine.entityCacheHolder.addEntities(reel, line, false, [entity]);
//     this._reelsEngine.moveEntityTo(entity, line, new Vector2(0.0, this._gameConfig.regularSpinConfig.collapseSpinSpeed),
//       this._gameConfig.regularSpinConfig.accelerationDuration,
//       this._reelsEngine.ReelConfig.getStopEasing(reel));
//   }
// }
