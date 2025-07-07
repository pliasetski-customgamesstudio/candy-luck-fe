// import { ISpinResponse, SpinResponse, InternalCollapsingSpecGroup } from "@cgs/common";
// import { AbstractListener, IFreeSpinsModeProvider, ResourcesComponent, IReelsConfigProvider, GameStateMachineNotifierComponent } from "@cgs/machines";
// import { ComponentIndex } from "@cgs/machines";
// import { Entity } from "@cgs/machines";
// import { ComponentNames } from "@cgs/machines";
// import { IGameStateMachineProvider } from "@cgs/machines";
// import { ISlotGameEngineProvider } from "@cgs/machines";
// import { IReelsConfig } from "@cgs/machines";
// import { ReelsEngine } from "@cgs/machines";
// import { GameStateMachineStates } from "@cgs/machines";
// import { T_ResourcesComponent, T_IFreeSpinsModeProvider, T_ISlotGameEngineProvider, T_IReelsConfigProvider, T_IGameStateMachineProvider, T_GameStateMachineNotifierComponent } from "@cgs/machines";
// import { SceneObject, Container, Action, SequenceAction, FunctionAction, EmptyAction, InterpolateInplaceAction, Vector2, ParallelAction } from "@cgs/syd";

// export class ShiftReelsAnimationProvider implements AbstractListener {
//   private static readonly InitialEntityReel: number = -1;
//   private static readonly InitialEnumerationInd: number = 0;

//   private _gmStMachine: CollapseGameStateMachine<ISpinResponse>;
//   private _multiplierNode: SceneObject;
//   private _modeProvider: IFreeSpinsModeProvider;
//   private _uniqueFsMode: string;
//   private _shiftDuration: number;
//   private _engine: ReelsEngine;
//   private _indexes: ComponentIndex[];
//   private _positionIndex: ComponentIndex;
//   private _reelIndex: ComponentIndex;
//   private _lineIndex: ComponentIndex;
//   private _drawableIndex: ComponentIndex;
//   private _enumerationIndex: ComponentIndex;
//   private _shiftIconIndex: ComponentIndex;
//   private _reelsConfig: IReelsConfig;

//   constructor(container: Container, { uniqueFsMode = "7", shiftDuration = 1.0 }: { uniqueFsMode?: string, shiftDuration?: number }) {
//     this._uniqueFsMode = uniqueFsMode;
//     this._shiftDuration = shiftDuration;

//     this._multiplierNode = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot.findById("multiplier");
//     this._modeProvider = container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);

//     this._engine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine as ReelsEngine;
//     this._reelsConfig = container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;

//     this._shiftIconIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.ShiftMarker);
//     this._positionIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.Position);
//     this._reelIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.ReelIndex);
//     this._lineIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.LineIndex);
//     this._drawableIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
//     this._enumerationIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.EnumerationIndex);

//     this._indexes = [this._drawableIndex, this._reelIndex, this._lineIndex, this._enumerationIndex, this._positionIndex];

//     this._gmStMachine = container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine as CollapseGameStateMachine;
//     this._gmStMachine.collapseState.appendLazyAnimation(() => this._getShiftAction(this._curResponse));
//     container.forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent).notifier.AddListener(this);
//   }

//   private get _curResponse(): ISpinResponse {
//     return this._gmStMachine.curResponse;
//   }

//   public OnStateEntered(slotState: string): void {
//     switch (slotState) {
//       case GameStateMachineStates.FreeSpinRecovery:
//         const symbol = this._curResponse.specialSymbolGroups.find(s => s.type === this._modeProvider.groupMarker);

//         this._changeMultiplierState("show", this._multiplierNode && this._modeProvider &&
//           symbol && symbol.symbolId.toString() === this._uniqueFsMode);
//         break;
//       case GameStateMachineStates.EndOfFreeSpinsPopup:
//         this._changeMultiplierState("hide", this._multiplierNode);
//         break;
//     }
//   }

//   public OnStateExited(slotState: string): void {
//     switch (slotState) {
//       case GameStateMachineStates.Scatter:
//         this._changeMultiplierState("show", this._multiplierNode && this._modeProvider &&
//           this._modeProvider.currentMode === this._uniqueFsMode);
//         break;
//     }
//   }

//   private _changeMultiplierState(stateName: string, conditions: boolean): void {
//     if (conditions) {
//       this._multiplierNode.stateMachine.switchToState(stateName);
//     }
//   }

//   private _getShiftAction(resp: SpinResponse): Action {
//     const group = resp.additionalData as InternalCollapsingSpecGroup;
//     if (group) {
//       resp.winLines = group.currentRound.winLines ? group.currentRound.winLines : [];
//       return new SequenceAction([
//         this._changeEntitiesPosition(group),
//         new FunctionAction(() => group.collapsingCounter++)]);
//     }
//     return new EmptyAction();
//   }

//   private _changeEntitiesPosition(group: InternalCollapsingSpecGroup): Action {
//     this._createAdditionalEntities(group);

//     const entities = this._engine.entityEngine.getEntities(this._engine.entityEngine.getFilterByIndex(this._indexes)).list.filter(x =>
//       x.get(this._reelIndex) >= ShiftReelsAnimationProvider.InitialEntityReel &&
//       x.get(this._reelIndex) < this._reelsConfig.reelCount &&
//       x.get<number>(this._lineIndex) >= 0 &&
//       x.get<number>(this._lineIndex) < this._reelsConfig.lineCount
//     );

//     const actions: Action[] = [];
//     const offsetPos = this._getOffsetBetweenEntities(entities);

//     entities.forEach(x => {
//       const interpolateAction = new InterpolateInplaceAction<Vector2>(v => v.clone())
//         .withInterpolateFunction(Vector2.LerpInplace)
//         .withValues(x.get(this._positionIndex), x.get(this._positionIndex) + offsetPos)
//         .withDuration(this._shiftDuration)
//         .withTimeFunction((time, start, dx) => time);

//       interpolateAction.valueChange.listen(e => {
//         x.set(this._positionIndex, e);
//       });

//       actions.push(interpolateAction);
//     });

//     const moveAction = new ParallelAction(actions);
//     return new SequenceAction([
//       new FunctionAction(() => this._setActualIndexes(entities)),
//       moveAction,
//       new FunctionAction(() => this._deleteNeedlessEntities(entities))
//     ]);
//   }

//   private _createAdditionalEntities(group: InternalCollapsingSpecGroup): void {
//     const offset = this._engine.internalConfig.reelsOffset[0];
//     for (let ind = 0; ind < this._reelsConfig.lineCount; ++ind) {
//       this._createEntity(ind,
//         group.currentRound.newReels[ind],
//         new Vector2(
//           offset.x - this._engine.ReelConfig.symbolSize.x,
//           this._engine.ReelConfig.symbolSize.y * ind + offset.y
//         )).register();
//     }
//   }

//   private _setActualIndexes(entities: Entity[]): void {
//     entities.forEach(x => x.addComponent(ComponentNames.ShiftMarker, false));

//     for (let reelInd = ShiftReelsAnimationProvider.InitialEntityReel; reelInd < this._reelsConfig.reelCount; ++reelInd) {
//       for (let lineInd = 0; lineInd < this._reelsConfig.lineCount; ++lineInd) {
//         const currentEntity = entities.find(x =>
//           x.get(this._reelIndex) === reelInd &&
//           x.get<number>(this._lineIndex) === lineInd &&
//           !x.get(this._shiftIconIndex));

//         currentEntity.set(this._reelIndex, reelInd + 1);
//         currentEntity.set(this._shiftIconIndex, true);

//         if (reelInd + 1 < this._reelsConfig.reelCount) {
//           const nextEntity = entities.find(x =>
//             x.get(this._reelIndex) === reelInd + 1 &&
//             x.get<number>(this._lineIndex) === lineInd);

//           currentEntity.set(
//             this._enumerationIndex, nextEntity.get(this._enumerationIndex));
//         }
//       }
//     }

//     entities.forEach(x => {
//       x.removeComponent(ComponentNames.ShiftMarker);
//       if (x.get(this._reelIndex) < this._reelsConfig.reelCount) {
//         this._engine.entityCacheHolder.replaceAnimationEntities(x.get(this._reelIndex), x.get<number>(this._lineIndex), [x]);
//         this._engine.entityCacheHolder.replaceSoundEntities(x.get(this._reelIndex), x.get<number>(this._lineIndex), [x]);
//       }
//     });
//   }

//   private _deleteNeedlessEntities(entities: Entity[]): void {
//     const deleteReelInd = this._reelsConfig.reelCount;
//     const deleteEntities = entities.filter(x => x.get(this._reelIndex) === deleteReelInd);
//     deleteEntities.forEach(x => {
//       x.unregister();
//     });
//   }

//   private _getOffsetBetweenEntities(entities: Entity[], { firstReel = 0, secondReel = 1 }: { firstReel?: number, secondReel?: number } = {}): Vector2 {
//     const firstEntityPos = entities.find(x =>
//       x.get(this._reelIndex) === firstReel).get(this._positionIndex);

//     const secondEntityPos = entities.find(x =>
//       x.get(this._reelIndex) === secondReel).get(this._positionIndex);

//     const offset = secondEntityPos - firstEntityPos;
//     offset.y = 0.0;
//     return offset;
//   }

//   private _createEntity(line: number, drawableId: number, position: Vector2): Entity {
//     const entity = new Entity(this._engine.entityEngine);
//     entity.addComponent(ComponentNames.DrawableIndex, drawableId);
//     entity.addComponent(ComponentNames.ReelIndex, ShiftReelsAnimationProvider.InitialEntityReel);
//     entity.addComponent(ComponentNames.LineIndex, line);
//     entity.addComponent(ComponentNames.Visible, true);
//     entity.addComponent(ComponentNames.EnumerationIndex, ShiftReelsAnimationProvider.InitialEnumerationInd);
//     entity.addComponent(ComponentNames.Position, position);
//     return entity;
//   }
// }
