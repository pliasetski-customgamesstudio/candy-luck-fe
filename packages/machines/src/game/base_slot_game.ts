import {
  SceneFactory,
  CustomGamesResourceCache,
  SceneCommon,
  ISlotMachineInfo,
  ICoordinateSystemInfoProvider,
  ISlotsApiService,
  ISplashManager,
  MachineSymbol,
  ISpinResponse,
  T_IClientProperties,
  T_ISlotsApiService,
  T_ISimpleUserInfoHolder,
  T_ISettingsManager,
  T_INavigationStack,
  T_IGameNavigator,
  T_ScaleManager,
  T_IQualifyingBetService,
  T_GameOperation,
  T_IBalanceUpdater,
  T_IBalanceUpdaterRegistrator,
  IBalanceUpdaterRegistrator,
} from '@cgs/common';
import { NetworkSymbol } from '@cgs/network';
import { ApplicationGameConfig, EnvironmentConfig, Logger } from '@cgs/shared';
import {
  Container,
  ResourcePackage,
  SceneObject,
  Platform,
  JSONResource,
  Button,
  Compatibility,
  Vector2,
  IDisposable,
  T_Platform,
} from '@cgs/syd';
import { IQualifyingBetService } from '../common/qualifying_bet_service';
import { AbstractSlotGame } from '../default_game/abstract_slot_game';
import { InitialReelsProvider } from '../initial_reels_provider';
import { LobbyFacade } from '../lobby_facade';
import { ISlotGame } from '../reels_engine/i_slot_game';
import { IGameParams } from '../reels_engine/interfaces/i_game_params';
import { ResponseProvider } from '../reels_engine/reel_net_api/response_provider';
import { GameStateMachine } from '../reels_engine/state_machine/game_state_machine';
import { SlotEventsTracker } from './common/analytics/slot_events_tracker';
import { BaseSlotSoundController } from './common/base_slot_sound_controller';
// import { BetGaugeShower } from "./common/bet_gauge_shower";
import { AutoSpinPanelViewListener } from './common/footer/controllers/auto_spin_panel_view_controller';
import { WinTextController } from './common/footer/controllers/win_text_controller';
import { FooterController } from './common/footer/footer_controller';
import { HudCoordinator } from './common/footer/hud_coordinator';
import { SpinViewMachineListener } from './common/footer/listeners/spin_view_machine_listener';
// import { PositionBasedSlotPanelTooltipActionQueue } from "./common/position_based_slot_panel_tooltip_action_queue";
import { DrawOrderConstants } from './common/slot/views/base_popup_view';
import {
  ISlotAnimationController,
  SlotAnimationController,
} from './common/slot_animation_controller';
import { SlotPopupCoordinator } from './common/slot_popup_coordinator';
import { SpinPauseProcessorService } from './common/spin_pause_processor_service';
import { AnimationAvailabilityProvider } from './components/animation_availability_provider';
import { AutoSpinsCounterController } from './components/auto_spins_counter_controller';
import { BalanceListenerProvider } from './components/balance_listener_provider';
import { BetUpdaterProvider } from './components/bet_updater_provider';
import { CheatComponent } from './components/cheat_component';
import { ClientDataRepositoryProvider } from './components/client_data_repository_provider';
import { CommonClientDataRepositoryProvider } from './components/common_client_data_repository_provider';
import { EndBonusGameComponent } from './components/end_bonus_game_component';
import { EndFreeSpinTriggerProvider } from './components/end_free_spin_trigger_provider';
import { EpicWinPopupProvider } from './components/epic_win/epic_win_popup_provider';
import { FastSpinDoClickActionProvider } from './components/fast_spin_do_click_action_provider';
import { FreeSpinElemetsProvider } from './components/freeSpins_logo_component';
import { GambleButtonProvider } from './components/gamble_button_provider';
import { GameConfigComponent } from './components/game_config_component';
import { GameStateMachineNotifierComponent } from './components/game_state_machine_notifier_component';
import { GameTimeAccelerationProvider } from './components/game_time_acceleration_provider';
import { IconModelComponent } from './components/icon_model_component';
import {
  IFooterProvider,
  ISlotPrimaryAnimationProvider,
} from './components/interfaces/i_slot_primary_animation_provider';
import { ISlotSessionProvider } from './components/interfaces/i_slot_session_provider';
import { LineModelComponent } from './components/line_model_component';
import { LinesSceneObjectComponent } from './components/lines_scene_object_component';
import { BonusGameProvider } from './components/mini_game/bonus_game_provider';
import { ScatterGameProvider } from './components/mini_game/scatter_game_provider';
import { ProgressiveBreakerProvider } from './components/node_tap_action/progressive_breaker/progressive_breaker_provider';
import { NotEnoughBalanceProvider } from './components/not_enough_balance_provider';
import { OptionalLoader } from './components/optional_loader';
import { BigWinPopupProvider } from './components/popups/big_win_popup_provider';
import { BonusRecoveryPopupComponent } from './components/popups/bonus_recovery_popup_component';
import { EndFreeSpinsPopupComponent } from './components/popups/end_freeSpins_popup_component';
import { JackPotWinPopupComponent } from './components/popups/jackpot_win_popup_component';
import { PaytablePopupComponent } from './components/popups/paytable_popup_component';
import { StartFreeSpinsPopupComponent } from './components/popups/start_freeSpins_popup_component';
import { AdditionalDataConverterComponent } from './components/reel_net_api/additional_data_converter_component';
import { SpecialSymbolGroupResponseConverterComponent } from './components/reel_net_api/special_symbol_group_response_converter_component';
import { WinLineResponseConverterComponent } from './components/reel_net_api/win_line_response_converter_component';
import { WinPositionResponseConverterComponent } from './components/reel_net_api/win_position_response_converter_component';
import { ReelsStateProvider } from './components/reels_state_provider';
import { ResourcesComponent } from './components/resources_component';
import { SceneCache } from './components/scene_cache';
import { SlotBetStorageProvider } from './components/slot_bet_storage_provider';
import { SlotSessionComponent } from './components/slot_session_component';
import { SomethingWentWrongProvider } from './components/something_went_wrong_provider';
import { StartGambleProvider } from './components/start_gamble_provider';
import { StickyMaxBetProvider } from './components/sticky_max_bet_provider';
import { CycledWinLineActionProvider } from './components/win_lines/complex_win_line_action_providers/cycled_win_line_action_provider';
import { BaseWinLinesConverter } from './components/win_lines/win_line_converters/base_win_lines_converter';
import { RegularWinLineStrategyPrivider } from './components/win_lines/win_line_strategy_providers/regular_win_line_strategy_privider';
import { BaseWinPositionsConverter } from './components/win_lines/win_position_converters/base_win_positions_converter';
import { IDebugGameService, DebugGameService } from './debug_game_services';
import { SpinResponseProvider } from './slot_response_provider';
import { StartGameResponseProvider } from './start_game_response_provider';
import { IGameStateMachineProvider } from '../reels_engine/game_components_providers/i_game_state_machine_provider';
import { TotalBetController } from './common/footer/controllers/total_bet_controller';
import { IGameComponentProvider } from './components/interfaces/i_game_component_provider';
import { IBetUpdaterProvider } from './components/i_bet_updater_provider';
import {
  T_IDebugGameService,
  T_IUnlockMachinesHandler,
  T_ISomethingWentWrongShower,
  T_ISlotSessionProvider,
  T_IStorageRepositoryProvider,
  T_CommonClientDataRepositoryProvider,
  T_SpinViewMachineListener,
  T_AdditionalDataConverterComponent,
  T_SpecialSymbolGroupResponseConverterComponent,
  T_WinLineResponseConverterComponent,
  T_WinPositionResponseConverterComponent,
  T_ResponseProvider,
  T_StartGameResponseProvider,
  T_ISlotAnimationController,
  T_IGameConfigProvider,
  T_IWinLineStrategyProvider,
  T_WinLineActionComponent,
  T_ILinesModelProvider,
  T_IReelsStateProvider,
  T_CheatComponent,
  T_QaCheatComponent,
  T_GameStateMachineNotifierComponent,
  T_FreeSpinElemetsProvider,
  T_StartFreeSpinsPopupComponent,
  T_JackPotWinPopupComponent,
  T_BigWinPopupProvider,
  T_EndFreeSpinsPopupComponent,
  T_BonusRecoveryPopupComponent,
  T_ScatterGameProvider,
  T_BonusGameProvider,
  T_IGameParams,
  T_IBetUpdaterProvider,
  T_StartGambleProvider,
  T_ISlotPopupCoordinator,
  T_IWinPositionsConverter,
  T_IWinLinesConverter,
  T_OptionalLoader,
  T_ProgressiveBonusAnimationProvider,
  T_ProgressiveBreakerProvider,
  T_SlotEventsTracker,
  T_IHudCoordinator,
  T_GambleButtonProvider,
  T_IInitialReelsProvider,
  T_SceneCache,
  T_PaytablePopupComponent,
  T_SomethingWentWrongProvider,
  T_NotEnoughBalanceProvider,
  T_EndFreeSpinTriggerProvider,
  T_AntiCheatProvider,
  T_WinTextController,
  T_TotalBetController,
  T_GameTimeAccelerationProvider,
  T_FastSpinDoClickActionProvider,
  T_AnimationAvailabilityProvider,
  T_SlotBetStorageProvider,
  T_AutoSpinPanelViewListener,
  T_AutoSpinsCounterController,
  T_EndBonusGameComponent,
  T_StickyMaxBetProvider,
  T_SpinPauseProcessorService,
  T_BalanceListenerProvider,
  T_CustomGamesGameResourcesProviderStub,
  T_ResourcesComponent,
  T_ISlotPrimaryAnimationProvider,
  T_BaseSlotSoundController,
  T_IGameStateMachineProvider,
  T_IconModelComponent,
  T_EpicWinPopupProvider,
  T_TotalWinCoinsProvider,
  T_LobbyFacade,
  T_LinesSceneObjectComponent,
  T_IFooterProvider,
  T_TutorialComponent,
} from '../type_definitions';
import { T_IBonusSharer } from '../i_bonus_sharer';
import { QaCheatComponent } from './components/qa_cheat_component';
import { SessionInfoHandler } from './components/session_info/session_info_handler';
import { TutorialComponent } from './common/footer/components/TutorialComponent';
import { GameConfigManager } from './game_config_manager';

export class OverridingComponentProvider {
  factory: any;
  type: any;

  constructor(factory: (c: Container) => any, type: symbol) {
    this.factory = factory;
    this.type = type;
  }
}

export abstract class ISlotContainerProvider {
  abstract get slotServiceContainer(): Container;
}

export class CustomGamesGameResourcesProviderStub {
  private _baseSlotGame: BaseSlotGame;

  constructor(baseSlotGame: BaseSlotGame) {
    this._baseSlotGame = baseSlotGame;
  }

  get isCustomHud(): boolean {
    return this._baseSlotGame.isCustomHud;
  }
}

export class BaseSlotGame
  extends AbstractSlotGame
  implements ISlotGame, ISlotContainerProvider, IDisposable
{
  private _sceneFactory: SceneFactory | null = null;
  private _resourceCache: CustomGamesResourceCache | null = null;
  private readonly _sceneCommon: SceneCommon;
  private _packages: ResourcePackage[] | null;
  private _linesConfig: Map<any, any> | null;
  private _winLinesConfig: Map<any, any> | null;
  private _symbolsBounds: Map<any, any> | null;
  private _gameConfig: Map<any, any> | null;
  private _footerControllerNew: FooterController | null;
  private _animationController: ISlotAnimationController | null;
  private _machineInfo: ISlotMachineInfo | null;
  private _debugServices: IDebugGameService | null;
  private _slot: SceneObject | null;
  private _bonusHolder: SceneObject | null;
  private _bg: SceneObject | null;
  protected _requiredComponents: symbol[];
  private _overridedComponents: OverridingComponentProvider[];
  private readonly _platform: Platform;
  private readonly _coordinateSystemProvider: ICoordinateSystemInfoProvider;
  private _slotService: ISlotsApiService | null;
  private _progress: ISplashManager | null;
  // private _lobbyArenaHolder: ILobbyArenaHolder | null;
  private _loadCustomHud: boolean;
  private _sessionInfoHandler: SessionInfoHandler;

  get isCustomHud(): boolean {
    return this._loadCustomHud;
  }

  constructor(
    lobbyFacade: LobbyFacade,
    platform: Platform,
    progress: ISplashManager,
    coordinateSystemProvider: ICoordinateSystemInfoProvider,
    gameParams: IGameParams,
    requiredComponents: any[],
    overridedComponents: OverridingComponentProvider[],
    sceneCommon: SceneCommon,
    loadCustomHud: boolean
  ) {
    super(gameParams, lobbyFacade);
    this._platform = platform;
    this._progress = progress;
    this._coordinateSystemProvider = coordinateSystemProvider;
    this._requiredComponents = requiredComponents;
    this._overridedComponents = overridedComponents;
    this._sceneCommon = sceneCommon;
    this._loadCustomHud = loadCustomHud;
    this._slotService = lobbyFacade.resolve(T_ISlotsApiService) as ISlotsApiService;
    // this._lobbyArenaHolder = lobbyFacade.resolve(T_ILobbyArenaHolder) as ILobbyArenaHolder;

    this._requiredComponents.push(T_CheatComponent);
    this._requiredComponents.push(T_ISlotPopupCoordinator);
    this._requiredComponents.push(T_TotalWinCoinsProvider);
    this._requiredComponents.push(T_ProgressiveBreakerProvider);
    this._requiredComponents.push(T_SlotEventsTracker);
    this._requiredComponents.push(T_SomethingWentWrongProvider);
    this._requiredComponents.push(T_NotEnoughBalanceProvider);
    this._requiredComponents.push(T_EndFreeSpinTriggerProvider);
    this._requiredComponents.push(T_AntiCheatProvider);
    this._requiredComponents.push(T_GameTimeAccelerationProvider);
    this._requiredComponents.push(T_FastSpinDoClickActionProvider);
    this._requiredComponents.push(T_EndBonusGameComponent);
    this._requiredComponents.push(T_StickyMaxBetProvider);
    this._requiredComponents.push(T_SpinPauseProcessorService);
    this._requiredComponents.push(T_BalanceListenerProvider);
    // this._requiredComponents.push(BetGaugeShower);
    // this._requiredComponents.push(PositionBasedSlotPanelTooltipActionQueue);

    this._requiredComponents.push(...lobbyFacade.getRequiredProviders());
    this._overridedComponents.push(...lobbyFacade.getReusableComponents());

    this._resourceCache = this._sceneCommon.resourceCache as CustomGamesResourceCache;
    this._sceneFactory = this._sceneCommon.sceneFactory;
  }

  get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }

  get winLinesConfig(): Record<string, any> | null {
    return this._winLinesConfig;
  }

  get gameConfig(): Record<string, any> {
    return this._gameConfig!;
  }
  get symbolsBounds(): Record<string, any> {
    return this._symbolsBounds!;
  }
  get linesConfig(): Record<string, any> {
    return this._linesConfig!;
  }

  get slotServiceContainer(): Container {
    return this.container;
  }

  async initSlotComponents(): Promise<void> {
    this.initComponentContainer();
    this.initCustomComponents();
  }

  initCustomComponents(): void {
    for (const c of this._overridedComponents) {
      this.registerAsSingleInstance(c.factory, c.type);
    }
  }

  initComponentContainer(): void {
    super.initComponentContainer();

    this.registerAsSingleInstance((_c: Container) => this.lobbyFacade, T_LobbyFacade);

    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'IDebugGameService');
      return new DebugGameService(c);
    }, T_IDebugGameService);
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'IFlowCoordinator');
    //     return this.lobbyFacade.resolve(IFlowCoordinator);
    //   },
    //   IFlowCoordinator
    // );
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'IFlowFacade');
    //     return this.lobbyFacade.resolve(IFlowFacade);
    //   },
    //   IFlowFacade
    // );
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'ISlotApiWatcher');
    //     return this.lobbyFacade.resolve(T_ISlotApiWatcher);
    //   },
    //   T_ISlotApiWatcher
    // );
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IClientProperties');
      return this.lobbyFacade.resolve(T_IClientProperties);
    }, T_IClientProperties);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISlotService');
      return this.lobbyFacade.resolve(T_ISlotsApiService);
    }, T_ISlotsApiService);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISimpleUserInfoHolder');
      return this.lobbyFacade.resolve(T_ISimpleUserInfoHolder);
    }, T_ISimpleUserInfoHolder);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'Platform');
      return this.lobbyFacade.resolve(T_Platform);
    }, T_Platform);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISettingsManager');
      return this.lobbyFacade.resolve(T_ISettingsManager);
    }, T_ISettingsManager);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IUnlockMachineHandler');
      return this.lobbyFacade.unlockMachinesHandler;
    }, T_IUnlockMachinesHandler);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISomethingWentWrongShower');
      return this.lobbyFacade.somethingWentWrongShower;
    }, T_ISomethingWentWrongShower);

    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'GameOperation');
      return this.lobbyFacade.gameOperation;
    }, T_GameOperation);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'BonusSharer');
      return this.lobbyFacade.bonusSharer;
    }, T_IBonusSharer);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'NavigationStack');
      return this.lobbyFacade.navigationStack;
    }, T_INavigationStack);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IGameNavigator');
      return this.lobbyFacade.gameNavigator;
    }, T_IGameNavigator);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ScaleManager');
      return this.lobbyFacade.scaleManager;
    }, T_ScaleManager);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IQualifyingBetService');
      return this.lobbyFacade.resolve(T_IQualifyingBetService) as IQualifyingBetService;
    }, T_IQualifyingBetService);

    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'ISlotSessionProvider');
      return new SlotSessionComponent(
        c,
        this._machineInfo!,
        this._sceneCommon,
        this._platform.view,
        this.gameParams.machineId
      );
    }, T_ISlotSessionProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'ClientDataRepositoryProvider');
      return new ClientDataRepositoryProvider(c);
    }, T_IStorageRepositoryProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'CommonClientDataRepositoryProvider');
      return new CommonClientDataRepositoryProvider(c, {});
    }, T_CommonClientDataRepositoryProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SpinViewMachineListener');
      return new SpinViewMachineListener(c);
    }, T_SpinViewMachineListener);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'AdditionalDataConverterComponent');
      return new AdditionalDataConverterComponent();
    }, T_AdditionalDataConverterComponent);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'SpecialSymbolGroupResponseConverterComponent');
      return new SpecialSymbolGroupResponseConverterComponent();
    }, T_SpecialSymbolGroupResponseConverterComponent);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'WinLineResponseConverterComponent');
      return new WinLineResponseConverterComponent();
    }, T_WinLineResponseConverterComponent);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'WinPositionResponseConverterComponent');
      return new WinPositionResponseConverterComponent();
    }, T_WinPositionResponseConverterComponent);
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'FakeMultireelReplacerConverterComponent');
    //     const result = new FakeMultireelReplacerConverterComponent();
    //     return result;
    //   },
    //   T_FakeMultireelReplacerConverterComponent
    // );
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SlotResponseProvider');
      return new SpinResponseProvider(c, this.gameParams);
    }, T_ResponseProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'StartGameResponseProvider');
      return new StartGameResponseProvider(c, this.gameParams, this.lobbyFacade.userInfoHolder);
    }, T_StartGameResponseProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SlotAnimationController');
      return new SlotAnimationController(c);
    }, T_ISlotAnimationController);
    this.registerAsSingleInstance((_c: Container) => {
      Logger.Debug('load ' + 'IBalanceUpdaterRegistrator');
      return this.lobbyFacade.resolve<IBalanceUpdaterRegistrator>(T_IBalanceUpdaterRegistrator);
    }, T_IBalanceUpdaterRegistrator);
    this.registerAsSingleInstance((_c: Container) => {
      Logger.Debug('load ' + 'IBalanceUpdater');
      return this.lobbyFacade.balanceUpdater;
    }, T_IBalanceUpdater);

    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'GameConfigProvider');
      return new GameConfigComponent(c, this._coordinateSystemProvider.displayResolution);
    }, T_IGameConfigProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'RegularWinLineStrategyPrivider');
      return new RegularWinLineStrategyPrivider(c);
    }, T_IWinLineStrategyProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'CycledWinLineActionProvider');
      return new CycledWinLineActionProvider(c);
    }, T_WinLineActionComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'LinesSceneObjectComponent');
      return new LinesSceneObjectComponent(c, this._resourceCache!);
    }, T_LinesSceneObjectComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'ILinesModelProvider');
      return new LineModelComponent(c);
    }, T_ILinesModelProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'ReelStateProvider');
      return new ReelsStateProvider(c);
    }, T_IReelsStateProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'CheatComponent');
      return new CheatComponent(c);
    }, T_CheatComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'QaCheatComponent');
      return new QaCheatComponent(c);
    }, T_QaCheatComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'GameStateMachineNotifierComponent');
      return new GameStateMachineNotifierComponent(c);
    }, T_GameStateMachineNotifierComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'FreeSpinElemetsProvider');
      return new FreeSpinElemetsProvider(c, []);
    }, T_FreeSpinElemetsProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'StartFreeSpinsPopupComponent');
      return new StartFreeSpinsPopupComponent(c, this._sceneCommon, {});
    }, T_StartFreeSpinsPopupComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'JackPotWinPopupComponent');
      return new JackPotWinPopupComponent(c, this._sceneCommon);
    }, T_JackPotWinPopupComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'BigWinPopupProvider');
      return new BigWinPopupProvider(c, this._sceneCommon);
    }, T_BigWinPopupProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'EndFreeSpinsPopupComponent');
      return new EndFreeSpinsPopupComponent(c, this._sceneCommon);
    }, T_EndFreeSpinsPopupComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'BonusRecoveryPopupComponent');
      return new BonusRecoveryPopupComponent(c, this._sceneCommon);
    }, T_BonusRecoveryPopupComponent);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'ScatterComponent');
      return new ScatterGameProvider(c, this._sceneCommon);
    }, T_ScatterGameProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'BonusGameComponent');
      return new BonusGameProvider(c, this._sceneCommon);
    }, T_BonusGameProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'IBetProviderUpdater');
      return new BetUpdaterProvider(
        c as Container,
        c.forceResolve<IGameParams>(T_IGameParams) as IGameParams
      );
    }, T_IBetUpdaterProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'StartGambleProvider');
      return new StartGambleProvider(c);
    }, T_StartGambleProvider);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'ISlotPopupCoordinator');
      return new SlotPopupCoordinator();
    }, T_ISlotPopupCoordinator);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IWinPositionConverter');
      return new BaseWinPositionsConverter();
    }, T_IWinPositionsConverter);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'IWinLinesConverter');
      return new BaseWinLinesConverter();
    }, T_IWinLinesConverter);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'OptionalLoader');
      return new OptionalLoader(this._sceneCommon);
    }, T_OptionalLoader);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'ProgressiveBreakerProvider');
      return new ProgressiveBreakerProvider(c, [T_ProgressiveBonusAnimationProvider]);
    }, T_ProgressiveBreakerProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SlotEventsTracker');
      return new SlotEventsTracker(c);
    }, T_SlotEventsTracker);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'HudCoordinator');
      return new HudCoordinator(c);
    }, T_IHudCoordinator);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'GambleButtonProvider');
      return new GambleButtonProvider(c);
    }, T_GambleButtonProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'InitialReelsProvider');
      const iconLimit = new Map<number, number>();
      iconLimit.set(0, 2);
      iconLimit.set(1, 2);
      iconLimit.set(2, 0);
      return new InitialReelsProvider(c, iconLimit);
    }, T_IInitialReelsProvider);
    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'SceneCache');
      return new SceneCache(this._sceneCommon.sceneFactory);
    }, T_SceneCache);
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'IFramePulse');
    //     const result = this.lobbyFacade.forcere(IFramePulse);
    //     return result;
    //   },
    //   IFramePulse
    // );

    if (EnvironmentConfig.useHTMLPayTable) {
      // const appSettings = this.lobbyFacade.resolve<IAppSettings>(T_IAppSettings)!;
      //
      // this.container
      //   .registerInstance(
      //     new PaytablePopupHTMLComponent(
      //       this._resourceCache?.getUrl(`games/${ApplicationGameConfig.gameId}`) || '',
      //       this.container,
      //       appSettings
      //     )
      //   )
      //   .as(T_PaytablePopupHTMLComponent);
    } else {
      this.registerAsSingleInstance(
        (c: Container) => new PaytablePopupComponent(c, this._sceneCommon),
        T_PaytablePopupComponent
      );
    }

    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SomethingWentWrongProvider');
      return new SomethingWentWrongProvider(c, this._sceneCommon);
    }, T_SomethingWentWrongProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'NotEnoughBalanceProvider');
      return new NotEnoughBalanceProvider(c, this._sceneCommon);
    }, T_NotEnoughBalanceProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'EndFreeSpinTriggerProvider');
      return new EndFreeSpinTriggerProvider(c);
    }, T_EndFreeSpinTriggerProvider);
    // this.registerAsSingleInstance((c: Container) => {
    //   Logger.Debug('load ' + 'AntiCheatProvider');
    //   const result = new AntiCheatProvider(c);
    //   return result;
    // }, T_AntiCheatProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'WinTextController');
      return new WinTextController(c);
    }, T_WinTextController);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'TotalBetController');
      return new TotalBetController(c);
    }, T_TotalBetController);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'GameTimeAccelerationProvider');
      return new GameTimeAccelerationProvider(c);
    }, T_GameTimeAccelerationProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'FastSpinDoClickActionProvider');
      return new FastSpinDoClickActionProvider(c);
    }, T_FastSpinDoClickActionProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'AnimationAvailabilityProvider');
      return new AnimationAvailabilityProvider(c);
    }, T_AnimationAvailabilityProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SlotBetStorageProvider');
      return new SlotBetStorageProvider(c);
    }, T_SlotBetStorageProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'AutoSpinPanelViewListener');
      return new AutoSpinPanelViewListener(c);
    }, T_AutoSpinPanelViewListener);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'AutoSpinsCounterController');
      return new AutoSpinsCounterController(c);
    }, T_AutoSpinsCounterController);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'EndBonusGameComponent');
      return new EndBonusGameComponent(c);
    }, T_EndBonusGameComponent);

    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'StickyMaxBetProvider');
      return new StickyMaxBetProvider(c);
    }, T_StickyMaxBetProvider);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'SpinPauseProcessorService');
      return new SpinPauseProcessorService(c);
    }, T_SpinPauseProcessorService);
    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'BalanceListenerProvider');
      return new BalanceListenerProvider(c);
    }, T_BalanceListenerProvider);
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'BetGaugeShower');
    //     const result = new BetGaugeShower(c);
    //     return result;
    //   },
    //   BetGaugeShower
    // );
    // this.registerAsSingleInstance(
    //   (c: Container) => {
    //     Logger.Debug('load ' + 'PositionBasedSlotPanelTooltipActionQueue');
    //     const result = new PositionBasedSlotPanelTooltipActionQueue(c);
    //     return result;
    //   },
    //   PositionBasedSlotPanelTooltipActionQueue
    // );

    this.registerAsSingleInstance(() => {
      Logger.Debug('load ' + 'CustomGamesGameResourcesProviderStub');
      return new CustomGamesGameResourcesProviderStub(this);
    }, T_CustomGamesGameResourcesProviderStub);

    this.registerAsSingleInstance((c: Container) => {
      Logger.Debug('load ' + 'TutorialComponent');
      return new TutorialComponent(c, this._slot!);
    }, T_TutorialComponent);
  }

  async loadResources(): Promise<void> {
    return this._loadResourcesInternal();
  }

  async initSlot(): Promise<void> {
    super.initSlot();

    for (const type of this._requiredComponents) {
      const provider = this.container.resolve(type);

      // Check if provider implements IGameComponentProvider and cast it to IGameComponentProvider
      if (f_isGameComponentProvider(provider)) {
        const gameComponentProvider = provider as IGameComponentProvider;
        gameComponentProvider.initialize();
      }
    }

    this.gameStateMachine.accelerate.entered.listen(() => this.accelerate_Entered());
    this.gameStateMachine.stopping.entered.listen(() => this.stopping_Entered());

    this._debugServices = this.container.forceResolve<IDebugGameService>(T_IDebugGameService);

    const sessionComponent =
      this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider);
    sessionComponent.slotSession.Init();
    this._footerControllerNew?.slotLoadFinished();

    this._sessionInfoHandler = new SessionInfoHandler(
      this.container,
      this._resourceCache?.getUrl(`games/${ApplicationGameConfig.gameId}`) || ''
    );
  }

  stopping_Entered(): void {
    // const gameOperation = this.container.forceResolve<GameOperation>(T_GameOperation);
    // gameOperation.topPanelController.stopRollingXpPercentage();
  }

  accelerate_Entered(): void {
    // const gameOperation = this.container.forceResolve<GameOperation>(T_GameOperation);
    // gameOperation.topPanelController.rollXpPercentage();
  }

  start(): void {
    this.gameStateMachine.doStart(this._machineInfo?.spinResult as ISpinResponse);

    const sessionComponent =
      this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider);
    sessionComponent.slotSession.updateTotalBetEvent();
  }

  getStartGameResponseProvider(): ResponseProvider<ISlotMachineInfo> {
    return this.container.forceResolve<StartGameResponseProvider>(T_StartGameResponseProvider);
  }

  async _loadResourcesInternal(): Promise<void> {
    const responseProvider = this.getStartGameResponseProvider();

    this._machineInfo = await responseProvider.doRequest();
    const resourceCache = this._sceneCommon.resourceCache;

    const game = `games/${ApplicationGameConfig.gameId}`;

    const resourcesComponent =
      this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._packages = [];

    // const clientProperties = this.container.forceResolve<IClientProperties>(T_IClientProperties);
    const tasks = [
      this.downloadTask(`${game}/slot_bg.zip`),
      this.downloadTaskByUrl('configs/line.zip'),
      this.downloadTask(`${game}/slot.zip`),
    ];

    await Promise.all(tasks);

    this._bg = this._sceneFactory?.build('slot_bg/scene') as SceneObject;
    this._bg.id = 'background';
    this._bg.initialize();
    const bgContainer = this._bg.findById('container');
    const bgCommon = this._sceneFactory?.build('slot_bg_common/scene');
    if (bgCommon && bgContainer) {
      bgCommon.initialize();
      bgContainer.addChild(bgCommon);
    }
    resourcesComponent.RegisterBack(this._bg);
    console.log('slot back loaded!');

    console.log('slot loaded!');
    this._progress?.step();
    this._slot = this._sceneFactory?.build('slot/scene') as SceneObject;

    this._slot.id = 'slot_machine';
    this._slot.initialize();
    this._slot.z = 10;
    this._bonusHolder = new SceneObject();
    this._bonusHolder.position = this._slot.position.clone();
    this._bonusHolder.scale = this._slot.scale.clone();
    this._bonusHolder.z = DrawOrderConstants.MiniGameViewDrawOrder;

    const sounds = this._sceneFactory?.build('slot/sounds') as SceneObject;
    sounds.initialize();

    let machineNodeId = 'machine';

    if (this.gameParams.machineId == '90') {
      machineNodeId = 'slot_0';
    }

    resourcesComponent.RegisterSlot(this._slot, null, machineNodeId);
    resourcesComponent.RegisetBonusHolder(this._bonusHolder);
    resourcesComponent.RegisterSound(sounds);

    if (this._resourceCache?.getResource(JSONResource.TypeId, 'slot/polylineSheet.json')) {
      this._linesConfig = this._resourceCache.getResource(
        JSONResource.TypeId,
        'slot/polylineSheet.json'
      ).data;
    }
    if (this._resourceCache?.getResource(JSONResource.TypeId, 'slot/symbolsBounds.json')) {
      this._symbolsBounds = this._resourceCache.getResource(
        JSONResource.TypeId,
        'slot/symbolsBounds.json'
      ).data;
    }
    if (this._resourceCache?.getResource(JSONResource.TypeId, 'config/lines.json')) {
      this._winLinesConfig = this._resourceCache.getResource(
        JSONResource.TypeId,
        'config/lines.json'
      ).data;
    }

    const gameConfigManager = new GameConfigManager(this._resourceCache?.getUrl(game) || '');
    this._gameConfig = await gameConfigManager.loadConfig();

    // let defaultConfig;
    // if (this._resourceCache?.getResource(JSONResource.TypeId, 'config/default_config.json')) {
    //   defaultConfig = this._resourceCache.getResource(
    //     JSONResource.TypeId,
    //     'config/default_config.json'
    //   ).data;
    // }
    //
    // let gameConfig = null;
    //
    // if (this._resourceCache?.getResource(JSONResource.TypeId, 'config/game_config.json')) {
    //   gameConfig = this._resourceCache.getResource(
    //     JSONResource.TypeId,
    //     'config/game_config.json'
    //   ).data;
    // }
    //
    // if (
    //   this._resourceCache?.getResource(JSONResource.TypeId, 'config/default_config.json') &&
    //   this._resourceCache?.getResource(JSONResource.TypeId, 'config/game_config.json')
    // ) {
    //   mergeMap(gameConfig, defaultConfig);
    //   if (gameConfig['namedSpinConfigs']) {
    //     mergeNamedConfigs(gameConfig['namedSpinConfigs'], defaultConfig);
    //   }
    // }
    //
    // this._gameConfig = defaultConfig;

    const optionalLoader = this.container.forceResolve<OptionalLoader>(T_OptionalLoader);
    await optionalLoader.load();

    const hudResourceUri = this._loadCustomHud
      ? `games/${ApplicationGameConfig.gameId}/bottom.zip`
      : 'games/HUD/bottom.zip';
    const footerLoadingTask = resourceCache.loadPackage(hudResourceUri);

    const footerPackage = await footerLoadingTask;

    this._progress?.step();
    this._packages.push(footerPackage);

    await this.loadAdditionalComponents(this._packages);

    this.container
      .forceResolve<ISlotPrimaryAnimationProvider>(T_ISlotPrimaryAnimationProvider)
      .attachPrimaryAnimationsToStateMachine();
    this._sceneFactory;
    const footer = this.container
      .forceResolve<IFooterProvider>(T_IFooterProvider)
      .GetFooter(this._sceneFactory!);
    footer.id = 'footer';
    footer.initialize();

    // Logger.Debug(html.window.navigator.userAgent);
    // Logger.Debug(html.window.navigator.appName);
    const fullScreenBtn = footer.findById<Button>('Size_button')!;
    if (fullScreenBtn && Compatibility.IsMobileBrowser && !Compatibility.IsSafari) {
      fullScreenBtn.clicked.listen(() => {
        throw new Error('Method not implemented.');
        // const isFullScreenMode = js.context.callMethod('isFullscreenMode');
        // js.context.callMethod(isFullScreenMode ? 'exitFullscreen' : 'enterFullscreen');
      });
    } else {
      fullScreenBtn.active = fullScreenBtn.touchable = fullScreenBtn.visible = false;
    }
    const fullReelBtn = footer.findById('fullReelBtn');
    if (fullReelBtn) {
      fullReelBtn.active = fullReelBtn.touchable = fullReelBtn.visible = false;
    }
    resourcesComponent.RegisterFooter(footer);
    // const placeholder = this.findById('hud_placeholder');
    //We can't use placeholder to put hud inside. Because
    footer.z = DrawOrderConstants.SlotHudViewDrawOrder;

    const buttonBarScene = footer.findById('button_bar');
    const hudSceneHolderScene = this.findById('hudSceneHolder');

    if (buttonBarScene && hudSceneHolderScene) {
      buttonBarScene.parent?.removeChild(buttonBarScene);
      hudSceneHolderScene.addChild(buttonBarScene);
    }

    this.addChild(footer);

    const hudNode = new SceneObject();
    hudNode.id = 'hudMovingNode';
    hudNode.position = new Vector2(0.0, 0.0);
    hudNode.z = DrawOrderConstants.AutoSpinDrawOrder;
    hudNode.initialize();
    this.addChild(hudNode);

    const _autoSpinPanel = this._sceneFactory?.build('bottom/sceneAutoSpinPanel') as SceneObject;
    _autoSpinPanel.id = 'AutoSpinPanelNode';
    _autoSpinPanel.initialize();
    _autoSpinPanel.z = DrawOrderConstants.AutoSpinDrawOrder;
    hudNode.addChild(_autoSpinPanel);
    const _betPanel = this._sceneFactory?.build('bottom/sceneBet') as SceneObject;
    _betPanel.id = 'SceneBet';
    _betPanel.initialize();
    _betPanel.z = DrawOrderConstants.AutoSpinDrawOrder;
    _betPanel.scale = new Vector2(0.75, 0.75);

    hudNode.addChild(_betPanel);
    this._footerControllerNew = new FooterController(
      footer,
      _betPanel,
      _autoSpinPanel,
      this.container
    );
    this._animationController = this.container.forceResolve<ISlotAnimationController>(
      T_ISlotAnimationController
    );

    this.initSlotFinished();
    return Promise.resolve();
  }

  async downloadTask(path: string): Promise<void> {
    const p = (await this._resourceCache?.loadPackage(path)) as ResourcePackage;
    this._packages?.push(p);
    return Promise.resolve();
  }

  async downloadTaskByUrl(path: string): Promise<void> {
    const p = (await this._resourceCache?.loadPackageByUrl(path)) as ResourcePackage;
    this._packages?.push(p);
    return Promise.resolve();
  }

  initSlotFinished(): void {
    this.container.forceResolve<BaseSlotSoundController>(T_BaseSlotSoundController);
  }

  toInternalSymbol(symbol: NetworkSymbol): MachineSymbol {
    const s = new MachineSymbol();
    s.id = symbol.id ?? 0;
    s.gains = symbol.gains?.map((x) => x ?? 0) as number[];
    s.stacked = symbol.stacked ?? 0;
    s.type = symbol.type as string;
    return s;
  }

  async loadAdditionalComponents(_packages: ResourcePackage[]): Promise<void> {
    return Promise.resolve();
  }

  async updateBets(): Promise<void> {
    return this.container.forceResolve<IBetUpdaterProvider>(T_IBetUpdaterProvider).updateBets();
  }

  update(dt: number): void {
    super.update(dt);
  }

  dispose(): void {
    try {
      this._footerControllerNew?.dispose();

      for (const componentType of this._requiredComponents) {
        const component = this.container.resolve(componentType);
        if (component && f_isGameComponentProvider(component)) {
          component.deinitialize();
        }
      }

      this._requiredComponents.length = 0;

      this.container
        .forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
        .deinitialize();
      const res = this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
      res.unload();
      const cheatComponent = this.container.forceResolve<CheatComponent>(T_CheatComponent);
      cheatComponent.dispose();
      if (this._requiredComponents.includes(T_BonusGameProvider)) {
        this.container.forceResolve<BonusGameProvider>(T_BonusGameProvider).dispose();
      }
      if (this._requiredComponents.includes(T_ScatterGameProvider)) {
        this.container.forceResolve<ScatterGameProvider>(T_ScatterGameProvider).dispose();
      }

      this.container.forceResolve<IconModelComponent>(T_IconModelComponent).dispose();
      this.container.forceResolve<OptionalLoader>(T_OptionalLoader).dispose();
      this.container.forceResolve<EpicWinPopupProvider>(T_EpicWinPopupProvider).dispose();
      this.container.resolve<SlotEventsTracker>(T_SlotEventsTracker)?.dispose();

      const slotSessionProvider =
        this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider);
      slotSessionProvider.dispose();

      this._sessionInfoHandler.dispose();
    } catch {
      //
    }

    if (this.isInitialized) {
      this.deinitialize();
    }

    if (this._packages) {
      this._packages.forEach((p) => {
        if (p) {
          this._resourceCache?.unloadPackage(p);
        }
      });
      this._packages = null;
    }
  }

  get gameNode(): SceneObject {
    return this;
  }

  getGameStateMachine(): GameStateMachine<ISpinResponse> {
    return this.gameStateMachine;
  }

  resolveComponent(type: any): any {
    return this.container.resolve(type);
  }

  get slotLoaded(): Promise<ISlotGame> {
    return this.slotLoadingCompleter.promise;
  }

  get slotStateMachineInitCompleted(): Promise<boolean> {
    return this.slotStateMachineLoaded.promise;
  }
}

function f_isGameComponentProvider(object: any): object is IGameComponentProvider {
  return (
    object &&
    typeof object.getSpecSymbolGroupsByMarker === 'function' &&
    typeof object.initialize === 'function' &&
    typeof object.deinitialize === 'function'
  );
  // You can add more detailed checks, like checking the function signatures
}
