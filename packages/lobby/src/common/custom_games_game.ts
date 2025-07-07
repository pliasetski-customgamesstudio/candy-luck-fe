import {
  CgsEvent,
  Color4,
  EventDispatcher,
  EventStream,
  IConcreteResourceCache,
  Platform,
  SceneObject,
  SpriteBatch,
  TemplateApplication,
  Vector2,
  VerticalAlignment,
} from '@cgs/syd';
import { Bootstrapper } from './bootstrapper';
import { ApplicationGameConfig, IocContainer } from '@cgs/shared';
import { IContextHolder, IAppPauseResumeEvents, ICustomGamesGame } from '@cgs/features';
import {
  T_ShowLobbyOnlySlot,
  ScaleManager,
  ScaleEntry,
  Rectangle,
  Stretch,
  ScaleInfo,
  T_ScaleManager,
  IWebGlChecker,
  INavigationStack,
  T_INavigationStack,
  IOperationContext,
  ICoordinateSystemInfoProvider,
  IOperationContextFactory,
  T_IOperationContextFactory,
} from '@cgs/common';
import { ShowLobbyOnlySlot } from '../lobby/show_lobby_only_slot';
import { GameIds } from '@cgs/machines';

enum CustomGamesGameType {
  Standalone,
  Facebook,
  SpecificSlotOnly,
}

export const T_CustomGamesGame = Symbol('CustomGamesGame');

export class CustomGamesGame
  extends TemplateApplication
  implements IContextHolder, IAppPauseResumeEvents, ICustomGamesGame, IWebGlChecker
{
  private readonly _root: SceneObject = new SceneObject();
  private readonly _componentsRoot: SceneObject = new SceneObject();
  private _navigationStack: INavigationStack;
  private _rootContext: IOperationContext;
  private _coordinateSystemInfoProvider: ICoordinateSystemInfoProvider;
  private readonly _bootstrapper: Bootstrapper;
  private readonly _paused: EventDispatcher<void> = new EventDispatcher<void>();
  private readonly _resumed: EventDispatcher<void> = new EventDispatcher<void>();

  constructor(
    platform: Platform,
    resourceCache: IConcreteResourceCache,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider
  ) {
    super(platform, resourceCache, coordinateSystemInfoProvider.coordinateSystem);
    this._coordinateSystemInfoProvider = coordinateSystemInfoProvider;
    this._bootstrapper = new Bootstrapper(this);
  }

  public get container(): IocContainer {
    return this._bootstrapper.container;
  }

  public get coordinateSystemInfoProvider(): ICoordinateSystemInfoProvider {
    return this._coordinateSystemInfoProvider;
  }

  public get isWebGl(): boolean {
    return this.platform.videoSystem.isWebGL;
  }

  public get root(): SceneObject {
    return this._root;
  }

  public activate(active: boolean): void {
    if (!active) {
      this.platform.audioSystem.pause();
    } else {
      this.platform.audioSystem.resume('Welcome back to the game! Tap OK to continue!');
    }
  }

  public async load(): Promise<void> {
    await this.startLobbyScaler();

    this._componentsRoot.addChild(this._root);

    this._navigationStack = this.container.resolve<INavigationStack>(T_INavigationStack)!;

    let showLobbyOperation: ShowLobbyOnlySlot | null = null;

    const operationContextFactory: IOperationContextFactory =
      this.container.resolve<IOperationContextFactory>(T_IOperationContextFactory)!;
    this._rootContext = await operationContextFactory.createOperationContext(true);
    showLobbyOperation = this._rootContext.initOperation<ShowLobbyOnlySlot>(T_ShowLobbyOnlySlot);

    showLobbyOperation.execute();

    /*const keyDownEvent = EventStreamProvider.subscribeTargetTyped<KeyboardEvent>(
      window,
      'keydown',
      (e) => {
        if (!(e instanceof KeyboardEvent)) {
          console.log('Wrong Keyboard event type');
          return;
        }
        const ke = e as KeyboardEvent;
        /!*if (ke.keyCode == html.KeyCode.ESC){
        handleBackCommand();
      }*!/
      },
      KeyboardEvent
    );*/
    return Promise.resolve();
  }

  public getCustomGamesGameType(): CustomGamesGameType {
    let gameType = CustomGamesGameType.Facebook;
    if (
      ApplicationGameConfig.machineId &&
      GameIds.isGameCodeExists(ApplicationGameConfig.machineId)
    ) {
      gameType = CustomGamesGameType.SpecificSlotOnly;
    } else if ((window as any)['STANDALONE_APP'] === 'true') {
      gameType = CustomGamesGameType.Standalone;
    } else {
      gameType = CustomGamesGameType.Facebook;
    }
    return gameType;
  }

  public async dispatchEvent(event?: CgsEvent): Promise<void> {
    if (event) {
      this._componentsRoot?.sendEvent(event);
    }
  }

  public drawImpl(spriteBatch: SpriteBatch): void {
    spriteBatch.clear(Color4.Black);
    this._componentsRoot?.draw(spriteBatch);
  }

  public updateImpl(dt: number): void {
    this._componentsRoot?.update(dt);
  }

  public async startLobbyScaler(): Promise<void> {
    const coordinateSystem = this._coordinateSystemInfoProvider.coordinateSystem;

    const bgMinPos = new Vector2(0.0, 0.0);
    const bgMinSize = this._coordinateSystemInfoProvider.coordinateSystem.size;

    const bgMaxPos = new Vector2(0.0, 0.0);
    const bgMaxSize = this._coordinateSystemInfoProvider.coordinateSystem.size;

    const scaleManager = this.container.resolve<ScaleManager>(T_ScaleManager)!;

    await scaleManager.lobbyScaler.initialize(
      [
        new ScaleEntry(
          new Rectangle(bgMinPos.x, bgMinPos.y, bgMinSize.x, bgMinSize.y),
          new Rectangle(bgMaxPos.x, bgMaxPos.y, bgMaxSize.x, bgMaxSize.y),
          true,
          true
        ),
      ],
      new Rectangle(0.0, 0.0, coordinateSystem.width, coordinateSystem.height),
      Stretch.Uniform,
      VerticalAlignment.Top
    );

    scaleManager.lobbyScaler.addScaleChangedListener((info) => {
      this._root.scale = info.scale;
      this._root.position = info.position;
    });

    scaleManager.lobbyScaler.invalidate();
  }

  private _scaleNode(info: ScaleInfo, node: SceneObject): void {
    node.scale = info.scale.clone();
    node.position = info.position.clone();
  }

  public contextLost(): void {
    super.contextLost();

    console.error('Webgl context lost');
  }

  public async contextReady(): Promise<void> {
    console.error('Webgl context ready');

    return super.contextReady();
  }

  public get rootContext(): IOperationContext {
    return this._rootContext;
  }

  public get resumed(): EventStream<void> {
    return this._resumed.eventStream;
  }

  public get paused(): EventStream<void> {
    return this._paused.eventStream;
  }

  public handleBackCommand(): boolean {
    return this._navigationStack.handleBackKey();
  }
}
