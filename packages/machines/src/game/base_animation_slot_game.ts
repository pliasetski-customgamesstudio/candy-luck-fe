// import { Disposable } from 'some-library';
// import { ISplashManager, ICoordinateSystemInfoProvider, IGameParams } from 'some-library';
// import { LobbyFacade, Platform } from 'some-library';
// import { BaseSlotGame } from 'some-library';
// import { AnimationBasedGameEngine } from 'some-library';
// import { Logger } from 'some-library';
// import { AnimationBasedGameConfigProvider } from 'some-library';
// import { AnimationBasedGameEngineProvider } from 'some-library';
// import { AnimationGameCheatSceneObjectProvider } from 'some-library';
// import { AnimationGameOutgoingActionProvider } from 'some-library';
// import { AnimationGameStopActionProvider } from 'some-library';
// import { InitialRandomIconsProvider } from 'some-library';
// import { AnimationEngineSlotPrimaryActionsProvider } from 'some-library';
// import { AnimationGameWinLineActionProvider } from 'some-library';
// import { FadeIconsProvider } from 'some-library';
// import { MultiSceneIconResourceProvider } from 'some-library';
// import { AnimationEngineSlotSoundController } from 'some-library';
// import { BaseSlotSoundController } from 'some-library';
//
// export class AnimationGameParams implements IGameParams {
//   gameId: string;
//   iconsCount: number;
//   groupsCount: number;
//   maxIconsPerGroup: number;
//
//   constructor(gameId: string, iconsCount: number, groupsCount: number, maxIconsPerGroup: number) {
//     this.gameId = gameId;
//     this.iconsCount = iconsCount;
//     this.groupsCount = groupsCount;
//     this.maxIconsPerGroup = maxIconsPerGroup;
//   }
// }
//
// export class BaseAnimationEngineSlotGame extends BaseSlotGame implements Disposable {
//   private _gameEngine: AnimationBasedGameEngine;
//
//   constructor(
//     lobbyFacade: LobbyFacade,
//     platform: Platform,
//     progress: ISplashManager,
//     coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
//     gameParams: IGameParams,
//     requiredComponents: Array<Function>,
//     overridedComponents: Array<OverridingComponentProvider>,
//     sceneCommon: SceneCommon,
//     { loadCustomHud = false }: { loadCustomHud?: boolean } = {}
//   ) {
//     super(
//       lobbyFacade,
//       platform,
//       progress,
//       coordinateSystemInfoProvider,
//       gameParams,
//       requiredComponents,
//       overridedComponents,
//       sceneCommon,
//       loadCustomHud
//     );
//   }
//
//   initComponentContainer(): void {
//     this.container.registerInstance(this.gameParams).as(AnimationGameParams);
//     this.container.registerInstance(this).as(BaseAnimationEngineSlotGame);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "AnimationGameConfigProvider");
//       const result = new AnimationBasedGameConfigProvider(c);
//       return result;
//     }, IAnimationBasedGameConfigProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "GameEngineComponent");
//       const result = new AnimationBasedGameEngineProvider(c, "slotHolder", null, "icon", "show", "hide");
//       return result;
//     }, ISlotGameEngineProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "CheatSceneObjectProvider");
//       const result = new AnimationGameCheatSceneObjectProvider(c);
//       return result;
//     }, AnimationGameCheatSceneObjectProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "SpinActionProvider");
//       const result = new AnimationGameOutgoingActionProvider(c);
//       return result;
//     }, IStartSlotActionProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "StopActionProvider");
//       const result = new AnimationGameStopActionProvider(c);
//       return result;
//     }, IStopSlotActionProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "InitialIconsProvider");
//       const result = new InitialRandomIconsProvider(c, true);
//       return result;
//     }, IInitialIconsProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "SlotAnimationComponent");
//       const result = new AnimationEngineSlotPrimaryActionsProvider(c);
//       return result;
//     }, ISlotPrimaryActionsProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "WinLineActionProvider");
//       const result = new AnimationGameWinLineActionProvider(c);
//       return result;
//     }, IWinLineActionProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "FadeIconsProvider");
//       const result = new FadeIconsProvider(c);
//       return result;
//     }, IFadeReelsProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "IconResourceProvider");
//       const result = new MultiSceneIconResourceProvider(sceneCommon);
//       return result;
//     }, AbstractIconResourceProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "SlotSoundController");
//       const result = new AnimationEngineSlotSoundController(c, [
//         new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Playing, "show"),
//         new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Stopped, "hide"),
//         new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Paused, "pause")
//       ]);
//       return result;
//     }, BaseSlotSoundController);
//
//     super.initComponentContainer();
//   }
//
//   async initSlot(): Promise<void> {
//     await super.initSlot();
//     this.container.resolve(AnimationGameCheatSceneObjectProvider);
//     this._gameEngine = this.container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
//   }
//
//   update(dt: number): void {
//     super.update(dt);
//     this._gameEngine.update(dt);
//   }
// }
