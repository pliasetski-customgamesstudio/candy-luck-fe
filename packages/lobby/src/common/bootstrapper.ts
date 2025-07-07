import { BootstrapperBase, CGSGame } from './bootstrapper_base';
import {
  ConnectionMonitor,
  IResponseBuilder,
  RequestSynchronizer,
  RequestSynchronizerConfig,
  RequestWatcher,
  SimpleUserApiService,
  SlotsApiService,
  T_IHttpClient,
  T_IRequestSynchronizer,
  T_RequestSynchronizerConfig,
} from '@cgs/network';
import {
  InitSettingsOperation,
  InitUserInfoOperation,
  LoginOperation,
  LoginOperationService,
  T_IAppPauseResumeEvents,
  T_IContextHolder,
  T_ICustomGamesGame,
  T_ILoginOperationService,
  T_IRootObjectHolder,
  T_LoginOperation,
  RefreshExternalUserService,
  T_RefreshExternalUserService,
  RefreshExternalUserOperation,
} from '@cgs/features';
import { T_CustomGamesGame } from './custom_games_game';
// import { StartupTimeMetter, T_StartupTimeMetter } from '@cgs/common';
// import { DownloadTaskCreator } from '@cgs/common';
import {
  AppResumeWatcher,
  AppSettings,
  BalanceUpdateService,
  Browser,
  CookieSessionStorage,
  CustomGamesResourceCache,
  ExceptionHandlerFacade,
  KnownServerErrorProvider,
  MachineDownloader,
  RequestSettings,
  ResponseBuilderServer1,
  SceneCommon,
  SceneFactory,
  ServerAnalyticsStorage,
  ServerAnalyticsTracker,
  SettingsManager,
  SimpleBalanceRefreshService,
  SimpleLobbyServiceServer1,
  SimpleUserInfoHolder,
  SlotOnlyAuthorizationHolder,
  SlotServiceServer1,
  StubDownloadableResourceManager,
  StubServerAnalyticsProcessor,
  T_CompositeGameController,
  T_GameController,
  T_GameOperation,
  T_IAppResumeNotifier,
  T_IAppResumeWatcher,
  T_IAppSettings,
  T_IAppState,
  T_IAuthorizationHolder,
  T_IBalanceRefreshService,
  T_IBalanceUpdater,
  T_IBalanceUpdaterRegistrator,
  T_IBetsUpdater,
  T_IBrowser,
  T_IClientProperties,
  T_IConnectionMonitor,
  T_IControllerFactory,
  T_ICoordinateSystemInfoProvider,
  T_IDownloadableResourceManager,
  T_IExceptionHandlerFacade,
  T_IGameAvailabilityCheck,
  T_IGameNavigator,
  T_ILocalSessionStorage,
  T_IMachineDownloader,
  T_INavigationStack,
  T_InitSettingsOperation,
  T_InitUserInfoOperation,
  T_IRequestNotifier,
  T_IRequestSettings,
  T_IRequestWatcher,
  T_IServerAnalyticsProcessor,
  T_IServerAnalyticsStorage,
  T_IServerAnalyticsTracker,
  T_ISessionHolder,
  T_ISettingsManager,
  T_ISimpleLobbyService,
  T_ISimpleUserInfoHolder,
  T_ISlotApiWatcher,
  T_ISlotsApiService,
  T_IWebGlChecker,
  T_KnownServerErrorProvider,
  T_RefreshExternalUserOperation,
  T_ScaleManager,
  T_SceneCommon,
  T_SceneFactory,
  T_ShowLobbyOnlySlot,
  T_SimpleUserApiService,
  T_SlotsApiService,
  T_StartupOnlySlotOperation,
} from '@cgs/common';
import { T_Platform, T_ResourceCache, T_SceneBuilder } from '@cgs/syd';
import {
  BonusSharer,
  CompositeGameController,
  GameController,
  GameLauncher,
  GameOperation,
  T_IBonusSharer,
  T_IGameLauncher,
} from '@cgs/machines';
import {
  IocContainer,
  EnvironmentName,
  EnvironmentConfig,
  T_AlertManager,
  AlertManager,
  ApplicationGameConfig,
} from '@cgs/shared';
import { GameNavigator } from '../services/game_navigator';
import { ShowLobbyOnlySlot } from '../lobby/show_lobby_only_slot';
import { StartupOnlySlotOperation } from './startup_only_slot';

export class Bootstrapper extends BootstrapperBase {
  constructor(game: CGSGame) {
    super(game);
  }

  initServices(): void {
    super.initServices();

    const requestSynchronizerConfig = new RequestSynchronizerConfig([
      // new ConditionPair(new ServiceAddressCondition("slots", "tutorialSpin"), new ServiceAddressCondition("contests", "useBooster")),
      // new ConditionPair(new ServiceAddressCondition("slots", "spin"), new ServiceAddressCondition("contests", "useBooster")),
      // new ConditionPair(new ServiceAddressCondition("slots", "modularSpin"), new ServiceAddressCondition("contests", "useBooster")),
      // new ConditionPair(new ServiceAddressCondition("slots", "spin"), new ServiceAddressCondition("challenge", "rewardChallenge")),
      // new ConditionPair(new ServiceAddressCondition("slots", "modularSpin"), new ServiceAddressCondition("challenge", "rewardChallenge")),
      // new ConditionPair(new ServiceAddressCondition("slots", "tutorialSpin"), new ServiceAddressCondition("challenge", "rewardChallenge")),
      // new ConditionPair(new ServiceAddressCondition("slots", "spin"), new ServiceAddressCondition("challenge", "rewardChallengeTask")),
      // new ConditionPair(new ServiceAddressCondition("slots", "modularSpin"), new ServiceAddressCondition("challenge", "rewardChallengeTask")),
      // new ConditionPair(new ServiceAddressCondition("slots", "tutorialSpin"), new ServiceAddressCondition("challenge", "rewardChallengeTask")),
      // new ConditionPair(new ServiceAddressCondition("slots", "spin"), new ServiceAddressCondition("challenge", "getChallengeConfig")),
      // new ConditionPair(new ServiceAddressCondition("slots", "modularSpin"), new ServiceAddressCondition("challenge", "getChallengeConfig")),
      // new ConditionPair(new ServiceAddressCondition("slots", "tutorialSpin"), new ServiceAddressCondition("challenge", "getChallengeConfig")),
      // new ConditionPair(new ServiceAddressCondition("challenge", "rewardChallengeTask"), new ServiceAddressCondition("challenge", "getChallengeConfig")),
      // new ConditionPair(new ServiceAddressCondition("challenge", "rewardChallenge"), new ServiceAddressCondition("challenge", "getChallengeConfig")),
      // new ConditionPair(new ServiceAddressCondition("authorization", "saveClientProperties"), new ServiceAddressCondition("authorization", "saveClientProperties"))
    ]);
    this.container.registerSingleton(T_RequestSynchronizerConfig, requestSynchronizerConfig);
    this.container.registerSingleton(
      T_IRequestSynchronizer,
      new RequestSynchronizer(requestSynchronizerConfig)
    );

    this.container.registerSingleton(T_IContextHolder, this.game);
    this.container.registerSingleton(T_IRootObjectHolder, this.game);
    this.container.registerSingleton(T_ICustomGamesGame, this.game);
    this.container.registerSingleton(T_CustomGamesGame, this.game);
    this.container.registerSingleton(T_IWebGlChecker, this.game);
    this.container.registerSingleton(T_IAppPauseResumeEvents, this.game);

    this.container.registerFactory(
      T_IAppSettings,
      (c) => new AppSettings(c.forceResolve(T_ISettingsManager)!, c.forceResolve(T_Platform))
    );

    this.container.registerFactory(
      T_IGameLauncher,
      (c) =>
        new GameLauncher(
          c.forceResolve(T_SceneFactory),
          c.forceResolve(T_ResourceCache),
          c.forceResolve(T_ICoordinateSystemInfoProvider),
          c.forceResolve(T_ScaleManager),
          c.forceResolve(T_IClientProperties)
        )
    );

    this.container.registerSingletonFactory(
      T_IBonusSharer,
      (c) =>
        new BonusSharer(
          c.forceResolve(T_ISimpleUserInfoHolder),
          c.forceResolve(T_IAppSettings) /*, c.forceResolve(T_ILobbyArenaHolder)*/
        )
    );
    this.container.registerSingletonFactory(
      T_SceneFactory,
      (c) => new SceneFactory(c.forceResolve(T_SceneBuilder), c.forceResolve(T_ResourceCache))
    );

    this.registerAnalyticsServices(this.container);

    this.container.registerSingletonFactory(
      T_ISimpleLobbyService,
      (c) =>
        new SimpleLobbyServiceServer1(
          c.forceResolve(T_SimpleUserApiService),
          c.forceResolve(T_ISessionHolder)
        )
    );

    // this.container.registerSingletonFactory(
    //   T_IDownloadTaskCreator,
    //   (c) =>
    //     new DownloadTaskCreator(
    //       c.forceResolve(T_ILocalizationInfoProvider),
    //       c.forceResolve(T_IDeviceInfoProvider),
    //       c.forceResolve(T_ICoordinateSystemInfoProvider),
    //       c.forceResolve(T_IClientProperties)
    //     )
    // );
    this.container.registerSingleton(T_ISettingsManager, new SettingsManager());
    // this.container.registerSingleton(T_IDownloadHistory, new DownloadHistory());

    this.container.registerSingleton(T_ILocalSessionStorage, new CookieSessionStorage());
    this.container.registerSingletonFactory(
      T_IExceptionHandlerFacade,
      (c) =>
        new ExceptionHandlerFacade(
          c.forceResolve(T_KnownServerErrorProvider),
          this.container,
          c.forceResolve(T_IAuthorizationHolder),
          c.forceResolve(T_ISessionHolder),
          c.forceResolve(T_IServerAnalyticsProcessor)
        )
    );

    this.container.registerSingletonFactory(
      T_IConnectionMonitor,
      (c) => new ConnectionMonitor(c.forceResolve(T_IExceptionHandlerFacade))
    );
    this.container.registerSingletonFactory(
      T_IRequestSettings,
      (c) => new RequestSettings(c.forceResolve(T_IClientProperties))
    );
    this.container.registerSingletonInstanceAs(
      [T_IRequestWatcher, T_IRequestNotifier],
      new RequestWatcher()
    );
    this.container.registerFactoryAs(
      [T_IAppState, T_IGameNavigator, T_IBetsUpdater, T_IGameAvailabilityCheck],
      (c) =>
        new GameNavigator(
          this.game,
          c.forceResolve(T_IMachineDownloader),
          c.forceResolve(T_ISimpleUserInfoHolder)
        )
    );

    const authHolder = new SlotOnlyAuthorizationHolder();
    this.container.registerSingleton(T_IAuthorizationHolder, authHolder);
    this.container.registerSingleton(T_ISessionHolder, authHolder);

    const balanceUpdateService = new BalanceUpdateService();
    this.container.registerSingleton(T_IBalanceUpdater, balanceUpdateService);
    this.container.registerSingleton(T_IBalanceUpdaterRegistrator, balanceUpdateService);
    this.container.registerSingletonFactory(
      T_IBalanceRefreshService,
      (c) =>
        new SimpleBalanceRefreshService(
          c.forceResolve(T_IAuthorizationHolder),
          c.forceResolve(T_ISimpleUserInfoHolder),
          c.forceResolve(T_ISimpleLobbyService),
          c.forceResolve(T_IBalanceUpdater)
        )
    );

    this.container.registerSingletonFactory(
      T_ISimpleUserInfoHolder,
      (_c) => new SimpleUserInfoHolder()
    );

    this.container.registerSingleton(T_IBrowser, new Browser());
    // this.container.registerSingleton(T_IClipboard, new Clipboard());

    this.container.registerSingletonFactoryAs(
      [T_IAppResumeWatcher, T_IAppResumeNotifier],
      (_c) => new AppResumeWatcher()
    );
    this.container.registerSingleton(T_IMachineDownloader, new MachineDownloader());

    // Errors
    this.container.registerSingleton(T_KnownServerErrorProvider, new KnownServerErrorProvider());

    // LoadingScreen
    // this.container.registerSingletonType(T_ILoadingScreenResourceLoader, LoadingScreenResourceLoader);
    // this.container.registerSingletonType(T_ILoadingScreenManager, LoadingScreenManager);
    // this.container.registerSingleton(T_StartupTimeMetter, new StartupTimeMetter());

    this.registerServerAnalytics(this.container);
    this.registerStubs(this.container);

    this.container.registerSingletonFactoryAs(
      [T_ISlotApiWatcher, T_ISlotsApiService],
      (c) =>
        new SlotServiceServer1(
          c.forceResolve(T_SlotsApiService),
          c.forceResolve(T_IAuthorizationHolder),
          c.forceResolve(T_ISimpleUserInfoHolder),
          c.forceResolve(T_IRequestSettings)
        )
    );

    this.container.registerFactory(
      T_SceneCommon,
      (c) => new SceneCommon(c.forceResolve(T_SceneFactory), c.forceResolve(T_ResourceCache))
    );

    this.container.registerSingletonFactory(
      T_ILoginOperationService,
      (c) => new LoginOperationService(c.forceResolve(T_IAuthorizationHolder))
    );

    // Manually register operations
    this.container.registerFactory(
      T_LoginOperation,
      (c, params) => new LoginOperation(params[0], c.forceResolve(T_ILoginOperationService))
    );

    this.container.registerSingletonFactory(
      T_RefreshExternalUserService,
      (c) =>
        new RefreshExternalUserService(
          c.forceResolve(T_IAuthorizationHolder),
          c.forceResolve(T_ISimpleUserInfoHolder),
          c.forceResolve(T_ISimpleLobbyService),
          c.forceResolve(T_ILoginOperationService),
          c.forceResolve(T_IBalanceUpdater)
        )
    );

    this.container.registerFactory(
      T_ShowLobbyOnlySlot,
      (c, params) =>
        new ShowLobbyOnlySlot(
          params[0],
          this.container,
          this.game,
          c.forceResolve(T_INavigationStack)
        )
    );
    this.container.registerFactory(
      T_StartupOnlySlotOperation,
      (_c, params) => new StartupOnlySlotOperation(params[0])
    );
    this.container.registerFactory(
      T_InitSettingsOperation,
      (c, params) => new InitSettingsOperation(params[0], c.forceResolve(T_IAppSettings))
    );
    this.container.registerFactory(
      T_InitUserInfoOperation,
      (c, params) => new InitUserInfoOperation(params[0], c.forceResolve(T_IBalanceRefreshService))
    );
    this.container.registerFactory(
      T_RefreshExternalUserOperation,
      (c, params) =>
        new RefreshExternalUserOperation(params[0], c.forceResolve(T_RefreshExternalUserService))
    );
    this.container.registerFactory(
      T_GameOperation,
      (c, params) =>
        new GameOperation(
          params[0],
          params[1],
          c.forceResolve(T_IGameLauncher),
          c.forceResolve(T_IControllerFactory),
          c.forceResolve(T_ISlotsApiService),
          this.container,
          c.forceResolve(T_IBalanceUpdater),
          c.forceResolve(T_IGameNavigator),
          this.game,
          c.forceResolve(T_ScaleManager),
          c.forceResolve(T_IBalanceRefreshService),
          c.forceResolve(T_AlertManager)
        )
    );

    // Manually register controller
    this.container.registerFactory(
      T_CompositeGameController,
      (c, params) =>
        new CompositeGameController(
          params[0],
          params[1],
          c.forceResolve(T_IClientProperties),
          c.forceResolve(T_ScaleManager),
          c.forceResolve(T_ICoordinateSystemInfoProvider),
          c.forceResolve(T_IAppState)
        )
    );
    this.container.registerFactory(
      T_GameController,
      (_c, params) => new GameController(params[0], params[1])
    );

    // Manually register API services
    this.container.registerSingletonFactory(
      T_SimpleUserApiService,
      (c) =>
        new SimpleUserApiService(
          c.forceResolve(T_IHttpClient),
          c.forceResolve(T_IExceptionHandlerFacade),
          c.forceResolve(T_IRequestSettings),
          c.forceResolve(T_IRequestNotifier),
          c.forceResolve(T_IRequestSynchronizer),
          c.forceResolve(T_IConnectionMonitor)
        )
    );

    const responseBuilder = new ResponseBuilderServer1();

    this.container.registerSingletonFactory(
      T_SlotsApiService,
      (c) =>
        new SlotsApiService(
          c.forceResolve(T_IHttpClient),
          c.forceResolve(T_IExceptionHandlerFacade),
          c.forceResolve(T_IRequestSettings),
          c.forceResolve(T_IRequestNotifier),
          c.forceResolve(T_IRequestSynchronizer),
          c.forceResolve(T_IConnectionMonitor),
          responseBuilder
        )
    );

    this.container.registerSingleton(
      T_AlertManager,
      new AlertManager(
        this.container
          .resolve<CustomGamesResourceCache>(T_ResourceCache)
          ?.getUrl(`games/${ApplicationGameConfig.gameId}`) || ''
      )
    );
  }

  registerStubs(container: IocContainer): void {
    container.registerSingleton(
      T_IDownloadableResourceManager,
      new StubDownloadableResourceManager()
    );
  }

  registerAnalyticsServices(_container: IocContainer): void {}

  registerServerAnalytics(_container: IocContainer): void {
    this.container.registerSingletonFactory(
      T_IServerAnalyticsProcessor,
      (_c) => new StubServerAnalyticsProcessor()
    );
    this.container.registerSingleton(T_IServerAnalyticsTracker, new ServerAnalyticsTracker());
    this.container.registerSingleton(T_IServerAnalyticsStorage, new ServerAnalyticsStorage());
  }
}
