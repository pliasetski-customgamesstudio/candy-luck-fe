import { IocContainer, T_IocContainer } from '@cgs/shared';
import { ICustomGamesGame, T_ICustomGamesGame } from '@cgs/features';
import {
  Application,
  FrameUpdateScene,
  T_IFramePulse,
  T_Platform,
  T_ResourceCache,
  T_SceneBuilder,
} from '@cgs/syd';
import { GameTimer } from '@cgs/common';
import { NavigationStack, T_INavigationStack } from '@cgs/common';
import { ClientProperties } from '@cgs/common';
import { IClientProperties, T_IClientProperties } from '@cgs/common';
import { LocalizationInfoProvider, T_ILocalizationInfoProvider } from '@cgs/common';
import { T_ICoordinateSystemInfoProvider } from '@cgs/common';
import { CustomGamesResourceCache, T_CustomGamesResourceCache } from '@cgs/common';
import { Lazy } from '@cgs/shared';
import { ViewContextManager } from '@cgs/common';
import { T_IViewContextManager } from '@cgs/common';
import { OperationContextFactory } from '@cgs/common';
import { T_IOperationContextFactory } from '@cgs/common';
import { ViewConfiguration } from '@cgs/common';
import { T_IViewConfiguration } from '@cgs/common';
import { ViewFactory } from '@cgs/common';
import { T_IViewFactory } from '@cgs/common';
import { T_IOperationContext } from '@cgs/common';
import { OperationContext } from '@cgs/common';
import { ScaleManager, T_ScaleManager } from '@cgs/common';
import { PopupEvents, T_IPopupEvents } from '@cgs/common';
import { ControllerRegistry, T_IControllerRegistry } from '@cgs/common';
// import { T_StartupTimeMetter } from '@cgs/common';
import { T_IViewContext } from '@cgs/common';
import { ViewContext } from '../lobby/view/view_context';
import { T_ICanvasManager } from '@cgs/common';
import { ControllerFactory } from '@cgs/common';
import { T_IControllerFactory } from '@cgs/common';
import { HttpClient } from '@cgs/network';
import { T_IHttpClient } from '@cgs/network';
import { T_ISilentCrashReporter } from '@cgs/common';
// import { BuildMode } from '@cgs/shared';
import { EmptySilentCrashReporter } from '@cgs/common';
import { RootCanvasManager } from '@cgs/common';

export type CGSGame = Application & ICustomGamesGame;

export class BootstrapperBase {
  private _game: CGSGame;
  private _container: IocContainer;

  public get game(): CGSGame {
    return this._game;
  }

  public get container(): IocContainer {
    return this._container;
  }

  constructor(game: CGSGame) {
    this._game = game;
    this.initServices();
  }

  protected initServices(): void {
    this._container = new IocContainer();
    this._container.registerSingleton(T_IocContainer, this._container);
    this._container.registerSingleton(T_ICustomGamesGame, this._game);

    const updater = new FrameUpdateScene();
    updater.initialize();
    updater.id = 'updater';
    this._game.root.addChild(updater);
    this._container.registerSingleton(T_IFramePulse, updater);
    GameTimer.setDefaultPulser(updater);

    // const isOwnCanvas = window == window.parent;

    this._registerForOwnCanvas(this._container);

    this._container.registerSingleton(T_Platform, this._game.platform);

    const navigationStack = new NavigationStack();
    this._container.registerSingleton(T_INavigationStack, navigationStack);
    const clientProperties = new ClientProperties();
    this._container.registerSingleton(T_IClientProperties, new ClientProperties());
    this._container.registerSingleton(T_ILocalizationInfoProvider, new LocalizationInfoProvider());
    this._container.registerSingleton(
      T_ICoordinateSystemInfoProvider,
      this._game.coordinateSystemInfoProvider
    );

    this._container.registerSingleton(T_SceneBuilder, this._game.sceneBuilder);

    const resourceCache = new CustomGamesResourceCache(
      // new Lazy<IAuthorizationHolder>(() => this._container.resolve(IAuthorizationHolder)),
      new Lazy<IClientProperties>(() => this._container.resolve(T_IClientProperties)!),
      this._container.resolve(T_ICoordinateSystemInfoProvider)!,
      this._container.resolve(T_ILocalizationInfoProvider)!,
      this._game.resourceCache
    );

    this._container.registerSingleton(T_ResourceCache, resourceCache);
    this._container.registerSingleton(T_CustomGamesResourceCache, resourceCache);

    const viewContextManager = new ViewContextManager(this._game.root, this._container);
    this._container.registerSingleton(T_IViewContextManager, viewContextManager);
    const operationContextFactory = new OperationContextFactory(
      viewContextManager,
      this._container
    );
    this._container.registerSingleton(T_IOperationContextFactory, operationContextFactory);

    const viewConfiguration = new ViewConfiguration(this._container);
    this._container.registerSingleton(T_IViewConfiguration, viewConfiguration);
    const viewFactory = new ViewFactory(
      this._container,
      viewConfiguration,
      resourceCache,
      this._game.sceneBuilder
    );
    this._container.registerSingleton(T_IViewFactory, viewFactory);

    this._container.registerFactory(
      T_IOperationContext,
      (c, positionalArgs) =>
        new OperationContext(
          positionalArgs[0],
          this._container,
          operationContextFactory,
          viewContextManager,
          navigationStack,
          c.forceResolve(T_ScaleManager),
          c.forceResolve(T_IPopupEvents),
          // c.forceResolve(T_StartupTimeMetter),
          c.forceResolve(T_IControllerRegistry)
        )
    );

    this._container.registerFactory(
      T_IViewContext,
      (c, params) =>
        new ViewContext(
          params[0],
          params[1],
          resourceCache,
          this._game.sceneBuilder,
          c.forceResolve(T_ICoordinateSystemInfoProvider),
          c.forceResolve(T_ScaleManager),
          viewFactory
        )
    );

    this._container.registerSingletonFactory(
      T_ScaleManager,
      (c) =>
        new ScaleManager(
          c.forceResolve(T_ICoordinateSystemInfoProvider),
          c.forceResolve(T_ICanvasManager),
          this._game.platform
        )
    );

    this._container.registerSingleton(
      T_IControllerFactory,
      new ControllerFactory(this._container, viewFactory, clientProperties)
    );
    this._container.registerSingleton(T_IControllerRegistry, new ControllerRegistry());
    this._container.registerSingleton(T_IHttpClient, new HttpClient());
    this._container.registerSingleton(
      T_ISilentCrashReporter,
      new EmptySilentCrashReporter() /*BuildMode.isDebug ? new EmptySilentCrashReporter() : new SilentCrashReporter(this._game.applicationInfo)*/
    );
    this._container.registerSingleton(T_IPopupEvents, new PopupEvents());
  }

  private _registerForOwnCanvas(container: IocContainer): void {
    container.registerSingleton(T_ICanvasManager, new RootCanvasManager());
  }
}
