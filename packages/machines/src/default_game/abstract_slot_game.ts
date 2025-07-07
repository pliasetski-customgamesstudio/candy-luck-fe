import { ISpinResponse, NeedToRereadException } from '@cgs/common';
import { Logger } from '@cgs/shared';
import {
  SceneObject,
  Container,
  Completer,
  IDisposable,
  FactoryFunc,
  IStreamSubscription,
} from '@cgs/syd';
import {
  T_BaseSlotGame,
  T_FreeSpinsSoundModelComponent,
  T_IFooterProvider,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotGame,
  T_ISlotGameEngineProvider,
  T_ISlotPrimaryAnimationProvider,
  T_ISpinParams,
  T_IconModelComponent,
  T_IconsSceneObjectComponent,
  T_IconsSoundModelComponent,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../type_definitions';
import { IGameParams } from '../reels_engine/interfaces/i_game_params';
import { ISlotGame } from '../reels_engine/i_slot_game';
import { LobbyFacade } from '../lobby_facade';
import { ISlotGameEngine } from '../reels_engine/i_slot_game_engine';
import { GameStateMachine } from '../reels_engine/state_machine/game_state_machine';
import { ResourcesComponent } from '../game/components/resources_component';
import { GameStateMachineComponent } from '../game/components/game_state_machine_component';
import { IconModelComponent } from '../game/components/icon_model_component';
import { IconsSceneObjectComponent } from '../game/components/icons_scene_object_component';
import { IconsSoundModelComponent } from '../game/components/icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from '../game/components/regular_spins_sound_model_component';
import { FreeSpinsSoundModelComponent } from '../game/components/free_spins_sound_model_component';
import { SlotPrimaryAnimationProvider } from '../game/components/slot_primary_animation_provider';
import { SlotSpinParams } from '../reels_engine/game_components/i_spin_params';
import { ISlotGameEngineProvider } from '../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IGameStateMachineProvider } from '../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FooterProvider } from '../game/components/interfaces/i_slot_primary_animation_provider';

export abstract class AbstractSlotGame extends SceneObject implements IDisposable {
  private _gameParams: IGameParams;
  private _container: Container = new Container();
  private _slotLoadingCompleter: Completer<ISlotGame> = new Completer();
  private _slotStateMachineLoaded: Completer<boolean> = new Completer();
  private _slotInitStateSub: IStreamSubscription | null = null;
  private _lobbyFacade: LobbyFacade;
  private _engine: ISlotGameEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _isInitialized: boolean = false;

  constructor(gameParams: IGameParams, lobbyFacade: LobbyFacade) {
    super();
    this._gameParams = gameParams;
    this._lobbyFacade = lobbyFacade;
  }

  get gameParams(): IGameParams {
    return this._gameParams;
  }
  get container(): Container {
    return this._container;
  }

  get slotLoadingCompleter(): Completer<ISlotGame> {
    return this._slotLoadingCompleter;
  }

  get slotStateMachineLoaded(): Completer<boolean> {
    return this._slotStateMachineLoaded;
  }

  get lobbyFacade(): LobbyFacade {
    return this._lobbyFacade;
  }

  get engine(): ISlotGameEngine {
    return this._engine;
  }

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // get gameNode(): SceneObject {
  //   throw new Error('Method not implemented.');
  // }

  // get slotLoaded(): Promise<ISlotGame> {
  //   throw new Error('Method not implemented.');
  // }

  // get slotStateMachineInitCompleted(): Promise<boolean> {
  //   throw new Error('Method not implemented.');
  // }

  // get gameConfig(): Record<string, any> {
  //   throw new Error('Method not implemented.');
  // }

  // get symbolsBounds(): Record<string, any> {
  //   throw new Error('Method not implemented.');
  // }

  // get linesConfig(): Record<string, any> {
  //   throw new Error('Method not implemented.');
  // }

  start(): void {}

  initialize(): void {
    if (!this._isInitialized) {
      super.initialize();
      this.initializeInternal();
      this._isInitialized = true;
    }
  }

  async initializeInternal(): Promise<void> {
    try {
      this.initSlotComponents();
      await this.loadResources();
      await this.initSlot();
      // TODO: AbstractSlotGame и ISlotGame не совместимы
      this._slotLoadingCompleter.complete(this as unknown as ISlotGame);
    } catch (e) {
      if (e instanceof NeedToRereadException) {
        window.location.reload();
      } else {
        this._slotLoadingCompleter.completeError(e);
      }
    }
  }

  initSlotComponents(): void {
    this.initComponentContainer();
  }

  initComponentContainer(): void {
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISlotGame');
      return this;
    }, T_ISlotGame);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IGameParams');
      return this.gameParams;
    }, T_IGameParams);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'BaseSlotGame');
      return this;
    }, T_BaseSlotGame);

    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'ResourcesComponent');
      return new ResourcesComponent(c, this);
    }, T_ResourcesComponent);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'GameStateMachineProvider');
      return new GameStateMachineComponent(c);
    }, T_IGameStateMachineProvider);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'IconModelComponent');
      return new IconModelComponent(c);
    }, T_IconModelComponent);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'IconsSceneObjectComponent');
      return new IconsSceneObjectComponent(c);
    }, T_IconsSceneObjectComponent);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'IconsSoundModelComponent');
      return new IconsSoundModelComponent(c);
    }, T_IconsSoundModelComponent);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'RegularSpinsSoundModelComponent');
      return new RegularSpinsSoundModelComponent(c);
    }, T_RegularSpinsSoundModelComponent);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'FreeSpinsSoundModelComponent');
      return new FreeSpinsSoundModelComponent(c);
    }, T_FreeSpinsSoundModelComponent);
    this.registerAsSingleInstance((c) => {
      Logger.Debug('load ' + 'SlotAnimationComponent');
      return new SlotPrimaryAnimationProvider(c);
    }, T_ISlotPrimaryAnimationProvider);
    this.registerAsSingleInstance((c) => {
      return new FooterProvider(c);
    }, T_IFooterProvider);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISpinParams');
      return new SlotSpinParams();
    }, T_ISpinParams);
  }

  loadResources(): Promise<void> {
    return new Promise<void>(() => {});
  }

  initSlot(): void {
    const reelsEngineProvider =
      this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider);
    const gameStateMachineProvider = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    );
    this._gameStateMachine =
      gameStateMachineProvider?.gameStateMachine as GameStateMachine<ISpinResponse>;
    this._slotInitStateSub = this._gameStateMachine.init.leaved.listen(() => {
      this._slotStateMachineLoaded.complete(true);
      this._slotInitStateSub?.cancel();
    });
    this._engine = reelsEngineProvider?.gameEngine as ISlotGameEngine;
  }

  registerAsSingleInstance<T>(factory: FactoryFunc<T>, type: symbol): void {
    this._container.register(factory).as(type).singleInstance();
  }

  update(dt: number): void {
    if (!this.active) {
      return;
    }

    if (this._gameStateMachine) {
      this._gameStateMachine.update(dt);
    }
    this.updateEngine(dt);
    super.update(dt);
  }

  updateEngine(dt: number): void {
    if (this._engine) {
      this._engine.update(dt);
    }
  }

  dispose(): void {
    this._container
      .forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
      .deinitialize();
    const res: ResourcesComponent =
      this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    res.unload();
    this._container.forceResolve<IconModelComponent>(T_IconModelComponent).dispose();
  }
}
