// export class ReelsSlotGameModule extends BaseSlotGameModule {
//   private _reelsEngine: ReelsEngine;
//   private _lobbyFacade: LobbyFacade;
//
//   constructor(
//     _lobbyFacade: LobbyFacade,
//     platform: Platform,
//     _coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
//     progress: ISplashManager,
//     moduleParams: IGameParams,
//     slotParams: IGameParams,
//     spinConditions: ModuleSpinConditions,
//     requiredComponents: Array<Type>,
//     overridedComponents: Array<OverridingComponentProvider>,
//     sceneCommon: SceneCommon
//   ) {
//     super(
//       platform,
//       _coordinateSystemInfoProvider,
//       progress,
//       moduleParams,
//       slotParams,
//       spinConditions,
//       requiredComponents,
//       overridedComponents,
//       sceneCommon,
//       _lobbyFacade
//     );
//     this.requiredComponents.push(GameConfigController);
//     this.requiredComponents.push(DisableBluredIconsComponent);
//   }
//
//   public initComponentContainer(): void {
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'IconDrawOrderCalculator');
//       const result = new IconDrawOrderCalculator();
//       return result;
//     }, IIconDrawOrderCalculator);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'IconEnumeratorComponent');
//       const result = new IconEnumeratorComponent(c);
//       return result;
//     }, IconEnumeratorComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'ReelsConfigComponent');
//       const result = new ReelsConfigComponent(c);
//       return result;
//     }, IReelsConfigProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'GameConfigController');
//       const result = new GameConfigController(c);
//       return result;
//     }, GameConfigController);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'ReelsEngineComponent');
//       const result = new ReelsEngineComponent(c, false);
//       return result;
//     }, ISlotGameEngineProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'SlotAnimationComponent');
//       const result = new SlotModulePrimaryActionsProvider(c);
//       return result;
//     }, ISlotPrimaryActionsProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'SpinActionProvider');
//       const result = new SpinActionComponent(c, false);
//       return result;
//     }, IStartSlotActionProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'StopActionProvider');
//       const result = new StopSlotModuleActionProvider(c, false, moduleParams.gameId);
//       return result;
//     }, IStopSlotActionProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'InitialReelsComponent');
//       const result = new InitialReelsComponent(c, { 0: 2, 1: 2, 2: 0 });
//       return result;
//     }, InitialReelsComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'WinLineActionProvider');
//       const result = new WinLineActionProvider(c);
//       return result;
//     }, IWinLineActionProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'GameTimeAccelerationProvider');
//       const result = new GameTimeAccelerationProvider(c);
//       return result;
//     }, GameTimeAccelerationProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'IClientProperties');
//       return _lobbyFacade.forceResolve<IClientProperties>(T_IClientProperties);
//     }, IClientProperties);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'DisableBluredIconsComponent');
//       const result = new DisableBluredIconsComponent(c);
//       return result;
//     }, DisableBluredIconsComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug('load ' + 'IconResourceProvider');
//       const result = new SingleSceneIconResourceProvider(
//         sceneCommon,
//         StringUtils.format('slot/module_{0}/icons', [moduleParams.gameId]),
//         StringUtils.format('additional_m{0}/icons', [moduleParams.gameId])
//       );
//       return result;
//     }, AbstractIconResourceProvider);
//     // Cheat component in module is null
//     //    _registerAsSingleInstance((c) => { Logger.Debug("load " + "TouchActionIconProvider"); var result = new TouchActionIconProvider(c, { ActionNodeMouseState.Swipe:[new CheatProviderStrategy(c)] }); return result;}, TouchActionIconProvider);
//
//     super.initComponentContainer();
//   }
// }
