// import { AbstractSlotGameModule } from '../default_game/abstract_slot_game_module';
// import {
//   ICoordinateSystemInfoProvider,
//   ISplashManager,
//   SceneCommon,
//   SceneFactory,
// } from '@cgs/common';
// import { Platform, ResourceCache, SceneObject } from '@cgs/syd';
// import { MachineInfoDTO } from '@cgs/network';
// import { LobbyFacade } from '../lobby_facade';
// import { OverridingComponentProvider } from './base_slot_game';
// import { T_ILobbyArenaHolder } from '../type_definitions';
// import { Logger } from '@cgs/shared';
// import { IGameParams } from '../reels_engine/interfaces/i_game_params';
// import { ModuleSpinConditions } from '../reels_engine/i_slot_game_module';
//
// export class BaseSlotGameModule extends AbstractSlotGameModule {
//   private _sceneFactory: SceneFactory | null = null;
//   private _resourceCache: ResourceCache | null = null;
//   private _sceneCommon: SceneCommon | null = null;
//   private _info: MachineInfoDTO;
//   private _coordinateSystemInfoProvider: ICoordinateSystemInfoProvider;
//   private _progress: ISplashManager;
//   private _lobbyFacade: LobbyFacade;
//
//   private _root: SceneObject;
//   private _module: SceneObject;
//
//   private _linesConfig: Map<any, any>;
//   private _winLinesConfig: Map<any, any>;
//   private _symbolsBounds: Map<any, any>;
//
//   private requiredComponents: Array<any>;
//   private _overridedComponents: Array<OverridingComponentProvider>;
//
//   get sceneCommon(): SceneCommon {
//     return this._sceneCommon;
//   }
//
//   get linesConfig(): Map<any, any> {
//     return this._linesConfig;
//   }
//
//   get symbolsBounds(): Map<any, any> {
//     return this._symbolsBounds;
//   }
//
//   get logModuleId(): string {
//     return 'Module' + moduleParams.gameId + ': load ';
//   }
//
//   private _slotLoadingCompleter: Promise<any> = new Promise<any>();
//
//   constructor(
//     platform: Platform,
//     coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
//     progress: ISplashManager,
//     moduleParams: IGameParams,
//     slotParams: IGameParams,
//     spinConditions: ModuleSpinConditions,
//     requiredComponents: Array<any>,
//     overridedComponents: Array<OverridingComponentProvider>,
//     sceneCommon: SceneCommon,
//     lobbyFacade: LobbyFacade
//   ) {
//     super(moduleParams, slotParams, spinConditions);
//     this._lobbyArenaHolder = lobbyFacade.resolve(T_ILobbyArenaHolder);
//     this._resourceCache = sceneCommon.resourceCache;
//     this._sceneFactory = sceneCommon.sceneFactory;
//   }
//
//   initComponentContainer(): void {
//     super.initComponentContainer();
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'ReelsStateProvider');
//       return new ModuleReelsStateProvider(c);
//     }, IReelsStateProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'GameConfigProvider');
//       return new GameModuleConfigProvider(c, this._coordinateSystemInfoProvider.displayResolution);
//     }, IGameConfigProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'IconModelComponent');
//       return new IconModelComponent(c);
//     }, IconModelComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'IconsSceneObjectComponent');
//       return new IconsSceneObjectComponent(c);
//     }, IconsSceneObjectComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'IconsSoundModelComponent');
//       return new IconsSoundModelComponent(c);
//     }, IconsSoundModelComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'ModuleActionChecker');
//       return new ModuleActionChecker(c);
//     }, IModuleActionChecker);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'ILinesModelProvider');
//       return new SlotGameModuleLinesModelProvider(c);
//     }, ILinesModelProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'LinesSceneObjectComponent');
//       return new LinesSceneObjectComponent(c, this._resourceCache);
//     }, LinesSceneObjectComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'WinLineActionProvider');
//       return new NWaysLineActionProvider(c);
//     }, WinLineActionComponent);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'WinLineActionProvider');
//       return new RegularWinLineStrategyPrivider(c);
//     }, IWinLineStrategyProvider);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'IWinLinesConverter');
//       return new BaseWinLinesConverter();
//     }, IWinLinesConverter);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'IWinPositionConverter');
//       return new BaseWinPositionsConverter();
//     }, IWinPositionsConverter);
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug(this.logModuleId + 'OptionalLoader');
//       return new OptionalLoader(c, this._sceneCommon);
//     }, OptionalLoader);
//
//     for (let c of this._overridedComponents) {
//       this.registerAsSingleInstance(c.factory, c.type);
//     }
//   }
//
//   loadAdditionalComponents(): Promise<any> {
//     return new Promise<any>(() => {});
//   }
//
//   async load(packages: Array<ResourcePackage>): Promise<any> {
//     const resourceCache = this._sceneCommon.resourceCache;
//     // TODO: make gameid dynamic
//
//     const game = 'games/game' + this.slotParams.gameId;
//     const modulePackageId = StringUtils.format('/module_{0}.wad.xml', [this.moduleParams.gameId]);
//
//     const modulePackage = await resourceCache.loadPackage(game + modulePackageId);
//     packages.push(modulePackage);
//
//     this._progress.step();
//     this._module = this._sceneFactory.build(
//       StringUtils.format('slot/module_{0}/scene', [this.moduleParams.gameId])
//     );
//     this._module.initialize();
//     this._module.z = 10;
//
//     this._root = container
//       .forceResolve<ISlotGame>(T_ISlotGame)
//       .container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
//     const resourcesComponent = new ResourcesComponent(container, this._root);
//     container
//       .register((c) => resourcesComponent)
//       .as(ResourcesComponent)
//       .singleInstance();
//     resourcesComponent.RegisterSlot(
//       this._module,
//       StringUtils.format('module_{0}_holder', [this.moduleParams.gameId])
//     );
//
//     const polylineSheetResourceName = StringUtils.format('slot/module_{0}/polylineSheet.json', [
//       this.moduleParams.gameId,
//     ]);
//     if (resourceCache.getResource(JSONResource.TypeId, polylineSheetResourceName)) {
//       this._linesConfig = resourceCache.getResource(
//         JSONResource.TypeId,
//         polylineSheetResourceName
//       ).data;
//     }
//     const symbolsBoundsResourceName = StringUtils.format('slot/module_{0}/symbolsBounds.json', [
//       this.moduleParams.gameId,
//     ]);
//     if (resourceCache.getResource(JSONResource.TypeId, symbolsBoundsResourceName)) {
//       this._symbolsBounds = resourceCache.getResource(
//         JSONResource.TypeId,
//         symbolsBoundsResourceName
//       ).data;
//     }
//     const linesConfigResourceName = StringUtils.format('slot/module_{0}/config/lines.json', [
//       this.moduleParams.gameId,
//     ]);
//     if (resourceCache.getResource(JSONResource.TypeId, linesConfigResourceName)) {
//       this._winLinesConfig = resourceCache.getResource(
//         JSONResource.TypeId,
//         linesConfigResourceName
//       ).data;
//     }
//
//     this.initComponentContainer();
//
//     const loader = container.resolve(OptionalLoader);
//     await loader.load();
//
//     this._slotLoadingCompleter.complete();
//     return new Promise<any>(VoidType.value);
//   }
//
//   async initModule(): Promise<any> {
//     super.initModule();
//
//     for (let type of this.requiredComponents) {
//       const component = container.resolve(type);
//     }
//   }
//
//   dispose(): void {
//     try {
//       const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
//       if (res) {
//         res.unload();
//       }
//
//       for (let componentType of this.requiredComponents) {
//         const component = container.resolve(componentType);
//         if (component && component instanceof IGameComponentProvider) {
//           (component as IGameComponentProvider).deinitialize();
//         }
//       }
//
//       const iconModelComponent = container.forceResolve<IconModelComponent>(T_IconModelComponent);
//       if (iconModelComponent) {
//         iconModelComponent.dispose();
//       }
//       const optionalLoader = container.resolve(OptionalLoader);
//       if (optionalLoader) {
//         optionalLoader.dispose();
//       }
//     } catch (e) {}
//
//     super.dispose();
//   }
//
//   getComponent(type: any): any {
//     return container.resolve(type);
//   }
//
//   get moduleNode(): SceneObject {
//     return this;
//   }
//
//   registerComponent(factory: any, type: any): void {
//     this.registerAsSingleInstance(factory, type);
//   }
// }
