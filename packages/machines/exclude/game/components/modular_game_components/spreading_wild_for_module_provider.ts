// import { SubstituteModuleIconProvider, SpecialSymbolGroup, Action, LazyAction, IntervalAction, InterpolateInplaceAction, Vector2, SequenceSimpleAction, ParallelSimpleAction, FunctionAction, StopSoundAction, PlaySoundAction, EmptyAction, SceneObject } from 'machines';
// import { SceneCommon, ReelsEngine, ResourcesComponent, ScaleDependencyProvider, ReelsSoundModel } from 'syd';
// import { Container } from 'shared';
// import { ReelsEngine as ReelsEngineLibrary } from 'machines/src/reels_engine_library';
// import { RegularSpinsSoundModelComponent } from 'common';

// class SpreadingWildForModuleProvider extends SubstituteModuleIconProvider {
//   private _sceneCommon: SceneCommon;
//   private _reelsEngine: ReelsEngine;
//   private _resourcesComponent: ResourcesComponent;
//   private _scaleDependencyProvider: ScaleDependencyProvider;
//   private _reelsSoundModel: ReelsSoundModel;
//   private _root: SceneObject;

//   private _featureSceneName: string;
//   private _fsFeatureSceneName: string;
//   private _soundName: string;
//   private _featureStartAnimName: string;
//   private _featureFlyAnimName: string;
//   private _featureEndAnimName: string;

//   private _flyingFeatureNodes: Map<SpecialSymbolGroup, SceneObject> = new Map<SpecialSymbolGroup, SceneObject>();

//   constructor(container: Container, sceneCommon: SceneCommon, symbolMap: SubstituteIconItem[], affectedModules: string[],
//       featureSceneName: string, fsFeatureSceneName: string, soundName: string, allowPartialSubstitution: boolean, marker: string, substituteStateName: string,
//       { featureStartAnimName = "anim_0", featureFlyAnimName = "anim_1", featureEndAnimName = "anim_2",
//       useLineIndexInSearch = false, takeFirstSubstituteIconIfNull = true, useInStrategy = false }: {
//         featureStartAnimName?: string, featureFlyAnimName?: string, featureEndAnimName?: string,
//         useLineIndexInSearch?: boolean, takeFirstSubstituteIconIfNull?: boolean, useInStrategy?: boolean } = {})
//   {
//     super(container, symbolMap, allowPartialSubstitution, marker, affectedModules, substituteStateName,
//       { useLineIndexInSearch: false, takeFirstSubstituteIconIfNull: true, useInStrategy: false });
//     this._sceneCommon = sceneCommon;
//     this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine as ReelsEngine;
//     this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
//     this._scaleDependencyProvider = container.resolve(ScaleDependencyProvider);
//     this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(T_RegularSpinsSoundModelComponent).regularSpinSoundModel;
//     this._root = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
//     this._featureSceneName = featureSceneName;
//     this._fsFeatureSceneName = fsFeatureSceneName;
//     this._soundName = soundName;
//     this._featureStartAnimName = featureStartAnimName;
//     this._featureFlyAnimName = featureFlyAnimName;
//     this._featureEndAnimName = featureEndAnimName;
//   }

//   buildBeforeSubstituteAction(symbol: SpecialSymbolGroup): Action {
//     this._flyingFeatureNodes.set(symbol, this.buildFeatureScene());

//     const movingAction = new LazyAction(() => {
//       const duration = (this._flyingFeatureNodes.get(symbol).stateMachine.findById(this._featureFlyAnimName).enterAction as IntervalAction).duration;

//       const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
//         .withInterpolateFunction(Vector2.LerpInplace)
//         .withValues(this.getStartMovingScenePosition(symbol), this.getDestinationMovingScenePosition(symbol))
//         .withTimeFunction((time, start, dx) => time)
//         .withDuration(duration);

//       interpolateAction.valueChange.subscribe((e) => {
//         this._flyingFeatureNodes.get(symbol).position = e;
//       });

//       return interpolateAction;
//     });

//     const reelIndex = symbol.positions[0];
//     const entity = this._reelsEngine.getStopedEntities(reelIndex, 0)[0];

//     const sound = this._reelsSoundModel.getSoundByName(this._soundName);

//     return new SequenceSimpleAction([
//       new ParallelSimpleAction([
//         new FunctionAction(() => {
//           this._flyingFeatureNodes.get(symbol).visible = true;
//           this._flyingFeatureNodes.get(symbol).position = this.getStartMovingScenePosition(symbol);
//           this._root.addChild(this._flyingFeatureNodes.get(symbol));
//           this._flyingFeatureNodes.get(symbol).stateMachine.switchToState(this._featureStartAnimName);
//           this._reelsEngine.iconAnimationHelper.startAnimOnEntity(entity, substituteStateName);
//           }),
//         new SequenceSimpleAction([
//           new StopSoundAction(sound),
//           new PlaySoundAction(sound)]),
//         new EmptyAction().withDuration((this._flyingFeatureNodes.get(symbol).stateMachine.findById(this._featureStartAnimName).enterAction as IntervalAction).duration)]),
//       movingAction]);
//   }

//   buildAfterSubstituteAction(symbol: SpecialSymbolGroup): Action {
//     return this._flyingFeatureNodes.has(symbol)
//       ? new SequenceSimpleAction([
//         new EmptyAction().withDuration((this._flyingFeatureNodes.get(symbol).stateMachine.findById(this._featureEndAnimName).enterAction as IntervalAction).duration),
//         new FunctionAction(() => {
//           this._flyingFeatureNodes.get(symbol).parent.removeChild(this._flyingFeatureNodes.get(symbol));
//           this._flyingFeatureNodes.get(symbol).deinitialize();
//           this._flyingFeatureNodes.delete(symbol);
//           })])
//       : new EmptyAction();
//   }

//   private getDestinationMovingScenePosition(symbol: SpecialSymbolGroup): Vector2 {
//     const module = modularSlotGame.modules.find((m) => m.moduleParams.gameId == symbol.affectedModules[0]);
//     const moduleReelsEngine = module.getComponent(ISlotGameEngineProvider).gameEngine as ReelsEngine;
//     const moduleResourceComponents = module.getComponent(ResourcesComponent);
//     const moduleScaleDependencyProvider = module.getComponent(ScaleDependencyProvider);
//     const reelIndex = symbol.positions[0];
//     const positionIndex = moduleReelsEngine.entityEngine.getComponentIndex(ComponentNames.Position);
//     const entity = moduleReelsEngine.getStopedEntities(reelIndex, 0)[0];
//     const entityPosition = entity.get(positionIndex);

//     const animIconsHolder = moduleResourceComponents.slot.findById("anim_icons_holder");

//     const currentMachineScale = moduleScaleDependencyProvider
//         ? moduleScaleDependencyProvider.currentMachineScale
//         : new Vector2(1.0, 1.0);

//     const animIconsHolderPosition = new Vector2(animIconsHolder.worldTransform.tx, animIconsHolder.worldTransform.ty);
//     this._resourcesComponent.root.inverseTransform.transformVectorInplace(animIconsHolderPosition);

//     return animIconsHolderPosition.add(entityPosition.clone().multiply(currentMachineScale));
//   }

//   private getStartMovingScenePosition(symbol: SpecialSymbolGroup): Vector2 {
//     const reelIndex = symbol.positions[0];
//     const positionIndex = this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position);
//     const entity = this._reelsEngine.getStopedEntities(reelIndex, 0)[0];
//     const entityPosition = entity.get(positionIndex);

//     const animIconsHolder = this._resourcesComponent.slot.findById("anim_icons_holder");

//     const currentMachineScale = this._scaleDependencyProvider
//         ? this._scaleDependencyProvider.currentMachineScale
//         : new Vector2(1.0, 1.0);

//     const animIconsHolderPosition = new Vector2(animIconsHolder.worldTransform.tx, animIconsHolder.worldTransform.ty);
//     this._resourcesComponent.root.inverseTransform.transformVectorInplace(animIconsHolderPosition);

//     return animIconsHolderPosition.add(entityPosition.clone().multiply(currentMachineScale));
//   }

//   private buildFeatureScene(): SceneObject {
//     const featureSceneName = gameStateMachine.curResponse.freeSpinsInfo
//         && gameStateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted
//         ? this._fsFeatureSceneName : this._featureSceneName;

//     const scene = this._sceneCommon.sceneFactory.build(featureSceneName);
//     if (scene) {
//       scene.initialize();
//       scene.z = 99999;
//       scene.stateMachine.switchToState("default");
//       scene.visible = false;
//       scene.active = true;
//     }

//     return scene;
//   }
// }
