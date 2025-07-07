// import { BaseSlotGameModule } from "./BaseSlotGameModule";
// import { AnimationBasedGameEngine } from "./AnimationBasedGameEngine";
// import { SlotSubStage } from "./SlotSubStage";
// import { IGameParams } from "./IGameParams";
// import { AnimationGameParams } from "./AnimationGameParams";
// import { BaseAnimationEngineSlotGame } from "./BaseAnimationEngineSlotGame";
// import { AnimationBasedGameConfigProvider } from "./AnimationBasedGameConfigProvider";
// import { ISlotGameEngineProvider } from "./ISlotGameEngineProvider";
// import { AnimationBasedGameEngineProvider } from "./AnimationBasedGameEngineProvider";
// import { AnimationGameCheatSceneObjectProvider } from "./AnimationGameCheatSceneObjectProvider";
// import { AnimationGameOutgoingActionProvider } from "./AnimationGameOutgoingActionProvider";
// import { IStartSlotActionProvider } from "./IStartSlotActionProvider";
// import { AnimationGameStopActionProvider } from "./AnimationGameStopActionProvider";
// import { IStopSlotActionProvider } from "./IStopSlotActionProvider";
// import { InitialIconsProvider } from "./InitialIconsProvider";
// import { IInitialIconsProvider } from "./IInitialIconsProvider";
// import { AnimationEngineSlotModulePrimaryActionsProvider } from "./AnimationEngineSlotModulePrimaryActionsProvider";
// import { ISlotPrimaryActionsProvider } from "./ISlotPrimaryActionsProvider";
// import { AnimationGameWinLineActionProvider } from "./AnimationGameWinLineActionProvider";
// import { IWinLineActionProvider } from "./IWinLineActionProvider";
// import { FadeIconsProvider } from "./FadeIconsProvider";
// import { IFadeReelsProvider } from "./IFadeReelsProvider";
// import { MultiSceneIconResourceProvider } from "./MultiSceneIconResourceProvider";
// import { AbstractIconResourceProvider } from "./AbstractIconResourceProvider";
// import { SlotSoundController } from "./SlotSoundController";
// import { AnimationEngineSlotSoundController } from "./AnimationEngineSlotSoundController";
// import { SlotSoundConfigEntry } from "./SlotSoundConfigEntry";
// import { SlotSoundType } from "./SlotSoundType";
// import { SoundState } from "./SoundState";
//
// export class AnimationBasedSlotGameModule extends BaseSlotGameModule {
//     private _gameEngine: AnimationBasedGameEngine;
//
//     constructor(gameStage: SlotSubStage, gameParams: IGameParams, spinModes: string[], requiredComponents: Type[], overridedComponents: OverridingComponentProvider[],
//         globalGameService: GlobalGameService, sceneCommon: SceneCommon) {
//         super(gameStage, gameParams, spinModes, requiredComponents, overridedComponents, globalGameService, sceneCommon);
//     }
//
//     public initComponentContainer(gameStage: SlotSubStage, gameParams: IGameParams): void {
//         container.registerInstance(gameParams).as(AnimationGameParams);
//         container.registerInstance(this).as(BaseAnimationEngineSlotGame);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "AnimationGameConfigProvider");
//             const result = new AnimationBasedGameConfigProvider(c);
//             return result;
//         }, IAnimationBasedGameConfigProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "GameEngineComponent");
//             const result = new AnimationBasedGameEngineProvider(c, "slotHolder", null, "icon", "show", "hide");
//             return result;
//         }, ISlotGameEngineProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "CheatSceneObjectProvider");
//             const result = new AnimationGameCheatSceneObjectProvider(c);
//             return result;
//         }, AnimationGameCheatSceneObjectProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "SpinActionProvider");
//             const result = new AnimationGameOutgoingActionProvider(c);
//             return result;
//         }, IStartSlotActionProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "StopActionProvider");
//             const result = new AnimationGameStopActionProvider(c);
//             return result;
//         }, IStopSlotActionProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "InitialIconsProvider");
//             const result = new InitialIconsProvider(c, true);
//             return result;
//         }, IInitialIconsProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "SlotAnimationComponent");
//             const result = new AnimationEngineSlotModulePrimaryActionsProvider(c);
//             return result;
//         }, ISlotPrimaryActionsProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "WinLineActionProvider");
//             const result = new AnimationGameWinLineActionProvider(c, null, null);
//             return result;
//         }, IWinLineActionProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "FadeIconsProvider");
//             const result = new FadeIconsProvider(c);
//             return result;
//         }, IFadeReelsProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "IconResourceProvider");
//             const result = new MultiSceneIconResourceProvider(gameStage._sceneCommon);
//             return result;
//         }, AbstractIconResourceProvider);
//
//         this._registerAsSingleInstance((c) => {
//             Logger.Debug("load " + "SlotSoundController");
//             const result = new AnimationEngineSlotSoundController(c, [
//                 new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Playing, "show"),
//                 new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Stopped, "hide"),
//                 new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Paused, "pause")
//             ]);
//             return result;
//         }, BaseSlotSoundController);
//
//         super.initComponentContainer(gameStage, gameParams);
//     }
//
//     public initModule(): void {
//         super.initModule();
//
//         container.resolve(AnimationGameCheatSceneObjectProvider);
//         this._gameEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
//     }
//
//     public update(dt: any): void {
//         super.update(dt);
//         this._gameEngine.update(dt);
//     }
// }
