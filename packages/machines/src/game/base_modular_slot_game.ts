// import { Logger } from 'package:shared/shared.dart';
// import { BaseReelsSlotGame } from 'package:machines/machines.dart';
// import { IModularSlotGame, IModularSlotMachineInfo, BaseSlotGameModule, ISlotSessionProvider, ISlotPrimaryAnimationProvider, StartModularGameResponseProvider, ResponseProvider, ISlotGameModule, IGameStateMachineProvider, GameStateMachineNotifierComponent, RegularSpinsSoundModelComponent, IFadeReelsProvider, IModuleActionChecker, ResourcePackage } from 'package:machines/src/reels_engine_library.dart';
// import { LobbyFacade, Platform, ISplashManager, ICoordinateSystemInfoProvider, IGameParams, SceneCommon } from 'package:common/common.dart';
//
// export class BaseModularSlotGame extends BaseReelsSlotGame implements IModularSlotGame {
//   private _modules: BaseSlotGameModule[];
//   public get modules(): BaseSlotGameModule[] { return this._modules; }
//
//   constructor(
//     lobbyFacade: LobbyFacade,
//     platform: Platform,
//     progress: ISplashManager,
//     coordinateSystemProvider: ICoordinateSystemInfoProvider,
//     gameParams: IGameParams,
//     modules: BaseSlotGameModule[],
//     requiredComponents: Type[],
//     overridedComponents: OverridingComponentProvider[],
//     sceneCommon: SceneCommon,
//     loadCustomHud: boolean = false
//   ) {
//     super(lobbyFacade, platform, progress, coordinateSystemProvider, gameParams, requiredComponents, overridedComponents, sceneCommon, { loadCustomHud: loadCustomHud });
//     this._modules = modules;
//   }
//
//   public get modularMachineInfo(): IModularSlotMachineInfo {
//     return this.machineInfo as IModularSlotMachineInfo;
//   }
//
//   public initComponentContainer(): void {
//     super.initComponentContainer();
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "ModularSlotSessionComponent");
//       const result = new ModularSlotSessionProvider(c, this.modularMachineInfo, this.sceneCommon, this.platform.view, this.gameParams.gameId);
//       return result;
//     }, ISlotSessionProvider);
//
//     this.registerAsSingleInstance((c) => new ModularSlotPrimaryAnimationProvider(c), ISlotPrimaryAnimationProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "StartModularGameResponseProvider");
//       const result = new StartModularGameResponseProvider(c, this.gameParams);
//       return result;
//     }, StartModularGameResponseProvider);
//
//     this.registerAsSingleInstance((c) => {
//       Logger.Debug("load " + "SlotResponseProvider");
//       const result = new ModularSpinResponseProvider(c, this.gameParams);
//       return result;
//     }, ResponseProvider);
//
//     this.registerAsSingleInstance((c) => this.modules, List<ISlotGameModule>().runtimeType);
//
//     this.modules.forEach((m) => {
//       m.registerComponent((c) => this, IModularSlotGame);
//       m.registerComponent((c) => this, ISlotGame);
//       m.registerComponent((c) => this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider), ISlotSessionProvider);
//       m.registerComponent((c) => this.container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider), IGameStateMachineProvider);
//       m.registerComponent((c) => this.container.forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent), GameStateMachineNotifierComponent);
//       m.registerComponent((c) => this.container.forceResolve<RegularSpinsSoundModelComponent>(T_RegularSpinsSoundModelComponent), RegularSpinsSoundModelComponent);
//       m.registerComponent((c) => this.container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider), IFadeReelsProvider);
//       m.registerComponent((c) => this.container.resolve(ModuleActionChecker), IModuleActionChecker);
//     });
//
//     for (const c of this.overridedComponents) {
//       this.registerAsSingleInstance(c.factory, c.type);
//     }
//   }
//
//   public getStartGameResponseProvider(): ResponseProvider {
//     return this.container.resolve(StartModularGameResponseProvider);
//   }
//
//   public async initSlot(): Promise<void> {
//     for (const module of this.modules) {
//       await module.initModule();
//     }
//     await super.initSlot();
//   }
//
//   public async loadAdditionalComponents(packages: ResourcePackage[]): Promise<void> {
//     await super.loadAdditionalComponents(packages);
//     for (const module of this.modules) {
//       await module.load(packages).catchError((e, st) => {
//         slotLoadingCompleter.completeError(e);
//       });
//     }
//   }
//
//   public update(dt: number): void {
//     super.update(dt);
//     this.modules.forEach((m) => m.update(dt));
//   }
//
//   public dispose(): void {
//     this.modules.forEach((m) => m.dispose());
//     super.dispose();
//   }
// }
