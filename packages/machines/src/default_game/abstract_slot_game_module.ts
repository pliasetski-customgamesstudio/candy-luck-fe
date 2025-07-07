// import { Logger } from '@cgs/shared';
// import { SceneObject, Container, IDisposable } from '@cgs/syd';
// import {
//   T_IconModelComponent,
//   T_IconsSceneObjectComponent,
//   T_IconsSoundModelComponent,
//   T_IGameParams,
//   T_ISlotGameEngineProvider,
//   T_ISlotGameModule,
//   T_ISlotPrimaryAnimationProvider,
//   T_ISpinParams,
// } from '../type_definitions';
// import { ISlotGameModule, ModuleSpinConditions } from '../reels_engine/i_slot_game_module';
// import { IGameParams } from '../reels_engine/interfaces/i_game_params';
// import { ISlotGameEngine } from '../reels_engine/i_slot_game_engine';
// import { ISlotGameConfig } from '../reels_engine/game_components/i_slot_game_config';
// import { IconModelComponent } from '../game/components/icon_model_component';
// import { IconsSceneObjectComponent } from '../game/components/icons_scene_object_component';
// import { IconsSoundModelComponent } from '../game/components/icons_sound_model_component';
// import { SlotPrimaryAnimationProvider } from '../game/components/slot_primary_animation_provider';
// import { SlotSpinParams } from '../reels_engine/game_components/i_spin_params';
// import { ISlotGameEngineProvider } from '../reels_engine/game_components_providers/i_slot_game_engine_provider';

// export abstract class AbstractSlotGameModule
//   extends SceneObject
//   implements ISlotGameModule, IDisposable
// {
//   private _container: Container = new Container();
//   private _moduleParams: IGameParams;
//   private _slotParams: IGameParams;
//   private _moduleEngine: ISlotGameEngine;
//   private _moduleConfig: ISlotGameConfig;
//   private _moduleSpinConditions: ModuleSpinConditions;

//   constructor(
//     moduleParams: IGameParams,
//     slotParams: IGameParams,
//     moduleSpinConditions: ModuleSpinConditions
//   ) {
//     super();
//     this._moduleParams = moduleParams;
//     this._slotParams = slotParams;
//     this._moduleSpinConditions = moduleSpinConditions;
//   }

//   get container(): Container {
//     return this._container;
//   }

//   get moduleParams(): IGameParams {
//     return this._moduleParams;
//   }

//   get slotParams(): IGameParams {
//     return this._slotParams;
//   }

//   get moduleEngine(): ISlotGameEngine {
//     return this._moduleEngine;
//   }

//   get moduleConfig(): ISlotGameConfig {
//     return this._moduleConfig;
//   }

//   get moduleSpinConditions(): ModuleSpinConditions {
//     return this._moduleSpinConditions;
//   }

//   initComponentContainer(): void {
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'ISlotGameModule');
//       return this;
//     }, T_ISlotGameModule);
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'IGameParams');
//       return this.moduleParams;
//     }, T_IGameParams);
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'IconModelComponent');
//       const result = new IconModelComponent(this._container);
//       return result;
//     }, T_IconModelComponent);
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'IconsSceneObjectComponent');
//       const result = new IconsSceneObjectComponent(this._container);
//       return result;
//     }, T_IconsSceneObjectComponent);
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'IconsSoundModelComponent');
//       const result = new IconsSoundModelComponent(this._container);
//       return result;
//     }, T_IconsSoundModelComponent);
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'SlotAnimationComponent');
//       const result = new SlotPrimaryAnimationProvider(this._container);
//       return result;
//     }, T_ISlotPrimaryAnimationProvider);
//     this.registerAsSingleInstance(() => {
//       Logger.Debug('load ' + 'ISpinParams');
//       const result = new SlotSpinParams();
//       return result;
//     }, T_ISpinParams);
//   }

//   initModule(): void {
//     this.container.resolve(TouchActionIconProvider);
//     const reelsEngineProvider =
//       this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider);
//     this._moduleEngine = reelsEngineProvider.gameEngine;
//   }

//   update(dt: number): void {
//     if (this._moduleEngine) {
//       this._moduleEngine.update(dt);
//     }
//   }

//   dispose(): void {}

//   registerAsSingleInstance<T>(factory: () => T, type: symbol): void {
//     this._container.bind(type).toDynamicValue(factory).inSingletonScope();
//   }
// }
