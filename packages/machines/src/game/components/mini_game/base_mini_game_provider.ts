import {
  IBackHandler,
  IBonusEventAsyncProcessor,
  SceneCommon,
  CancellationTokenSource,
  INavigationStack,
  IBonusScene,
  IBonusRound,
  IBonusResponse,
  IResourceManager,
  BonusConfiguration,
  BonusContext,
  BonusScene,
  ReelWinPosition,
  ISpinResponse,
  BonusFinishedArgs,
  IStorageRepositoryProvider,
  T_IGameNavigator,
  T_INavigationStack,
} from '@cgs/common';
import { BackToLobbyGameResult, BonusGame, IBonusGame, IMiniGameService } from '@cgs/features';
import {
  IDisposable,
  Container,
  SceneObject,
  EventDispatcher,
  EventStream,
  JSONResource,
  ResourceCache,
  EventStreamSubscription,
} from '@cgs/syd';
import { LobbyFacade } from '../../../lobby_facade';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import {
  T_ResourcesComponent,
  T_GameStateMachineNotifierComponent,
  T_IGameStateMachineProvider,
  T_IStorageRepositoryProvider,
  T_LobbyFacade,
  T_IBonusExternalEventAsyncProcessor,
  T_DynamicDrawOrdersProvider,
  T_ISomethingWentWrongShower,
} from '../../../type_definitions';
import { DynamicDrawOrdersProvider } from '../dynamic_draw_orders_provider';
import {
  AbstractListener,
  GameStateMachineNotifier,
  GameStateMachineNotifierComponent,
} from '../game_state_machine_notifier_component';
import { ResourcesComponent } from '../resources_component';
import { IMiniGameProvider } from './i_mini_game_provider';
import { IBonusExternalEventAsyncProcessor } from './i_bonus_external_event_async_processor';
import { ISomethingWentWrongShower } from '../../../i_something_went_wrong_shower';
import { IGameNavigator } from '../../../i_game_navigator';
import { Func3 } from '@cgs/shared';

export abstract class BaseMiniGameProvider
  implements
    IMiniGameProvider,
    AbstractListener,
    IDisposable,
    IBackHandler,
    IBonusEventAsyncProcessor
{
  private _container: Container;
  private _sceneCommon: SceneCommon;
  private _stateId: string;
  private _hideSlot: boolean;
  private _hideHud: boolean;
  private _resourcesComponent: ResourcesComponent;
  private _stateMachine: GameStateMachine<ISpinResponse>;
  private _dynamicDrawOrdersProvider: DynamicDrawOrdersProvider;
  private _gameTypes: string[] | null;
  private _gameTypeToBonusId: Map<string, string>;
  private _cancellationTokenSource: CancellationTokenSource;
  private _finishingSub: EventStreamSubscription<void>;
  private _shownSub: EventStreamSubscription<void>;
  private _finishedSub: EventStreamSubscription<void>;
  private _updatedSub: EventStreamSubscription<void>;
  private _serverException: EventStreamSubscription<void>;
  private _externalScenesIds: string[];
  private _navigationStack: INavigationStack;
  private _lobbyFacade: LobbyFacade;
  private _bonusGame: IBonusGame | null;
  private _bonusScene: IBonusScene | null;
  private _bonusHolder: SceneObject;
  private _miniGameShownDispatcher: EventDispatcher<void>;
  private _miniGameFinishedDispatcher: EventDispatcher<BonusFinishedArgs>;
  private _miniGameUpdatedDispatcher: EventDispatcher<IBonusRound>;
  private _miniGameCreatedDispatcher: EventDispatcher<IBonusGame>;
  private _bonusExternalEventAsyncProcessor: IBonusExternalEventAsyncProcessor | null;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stateId: string,
    hideSlot: boolean,
    hideHud: boolean,
    gameTypes: string[] | null = null,
    externalScenesIds: string[] | null = null,
    gameTypeToBonusId: Map<string, string> | null = null
  ) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._stateId = stateId;
    this._hideSlot = hideSlot;
    this._hideHud = hideHud;
    this._gameTypes = gameTypes;
    this._externalScenesIds = externalScenesIds || [];
    this._gameTypeToBonusId =
      gameTypeToBonusId ||
      new Map<string, string>([
        ['bonusGame1', '0'],
        ['bonusGame2', '1'],
      ]);
    this._bonusExternalEventAsyncProcessor =
      this._container.resolve<IBonusExternalEventAsyncProcessor>(
        T_IBonusExternalEventAsyncProcessor
      ) ?? null;
    this._navigationStack = container.forceResolve<INavigationStack>(T_INavigationStack);
    this._resourcesComponent =
      this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._dynamicDrawOrdersProvider = this._container.forceResolve<DynamicDrawOrdersProvider>(
      T_DynamicDrawOrdersProvider
    );
    const notifier: GameStateMachineNotifier =
      this._container.forceResolve<GameStateMachineNotifierComponent>(
        T_GameStateMachineNotifierComponent
      ).notifier;
    this._lobbyFacade = this._container.forceResolve<LobbyFacade>(T_LobbyFacade);
    notifier.AddListener(this);

    this._miniGameShownDispatcher = new EventDispatcher();
    this._miniGameFinishedDispatcher = new EventDispatcher<BonusFinishedArgs>();
    this._miniGameUpdatedDispatcher = new EventDispatcher<IBonusRound>();
    this._miniGameCreatedDispatcher = new EventDispatcher<IBonusGame>();
  }

  get container(): Container {
    return this._container;
  }

  get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }

  get stateMachine(): GameStateMachine<ISpinResponse> {
    if (!this._stateMachine) {
      this._stateMachine = this._container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    }
    return this._stateMachine;
  }

  get dynamicDrawOrdersProvider(): DynamicDrawOrdersProvider {
    return this._dynamicDrawOrdersProvider;
  }

  get gameTypes(): string[] {
    return this._gameTypes as string[];
  }

  get gameTypeToBonusId(): Map<string, string> {
    return this._gameTypeToBonusId;
  }

  get cancellationTokenSource(): CancellationTokenSource {
    return this._cancellationTokenSource;
  }

  set cancellationTokenSource(value: CancellationTokenSource) {
    this._cancellationTokenSource = value;
  }

  get finishingSub(): EventStreamSubscription<void> {
    return this._finishingSub;
  }

  set finishingSub(value: EventStreamSubscription<void>) {
    this._finishingSub = value;
  }

  get shownSub(): EventStreamSubscription<void> {
    return this._shownSub;
  }

  set shownSub(value: EventStreamSubscription<void>) {
    this._shownSub = value;
  }

  get finishedSub(): EventStreamSubscription<void> {
    return this._finishedSub;
  }

  set finishedSub(value: EventStreamSubscription<void>) {
    this._finishedSub = value;
  }

  get updatedSub(): EventStreamSubscription<void> {
    return this._updatedSub;
  }

  set updatedSub(value: EventStreamSubscription<void>) {
    this._updatedSub = value;
  }

  get serverException(): EventStreamSubscription<void> {
    return this._serverException;
  }

  set serverException(value: EventStreamSubscription<void>) {
    this._serverException = value;
  }

  get externalScenesIds(): string[] {
    return this._externalScenesIds;
  }

  set externalScenesIds(value: string[]) {
    this._externalScenesIds = value;
  }

  get navigationStack(): INavigationStack {
    return this._navigationStack;
  }

  get lobbyFacade(): LobbyFacade {
    return this._lobbyFacade;
  }

  get bonusGame(): IBonusGame | null {
    return this._bonusGame;
  }

  set bonusGame(value: IBonusGame) {
    this._bonusGame = value;
  }

  get bonusScene(): IBonusScene | null {
    return this._bonusScene;
  }

  set bonusScene(value: IBonusScene) {
    this._bonusScene = value;
  }

  get bonusNode(): SceneObject {
    return this._bonusHolder;
  }

  set bonusHolder(value: SceneObject) {
    this._bonusHolder = value;
  }

  get miniGameShownDispatcher(): EventDispatcher<void> {
    return this._miniGameShownDispatcher;
  }

  get onMiniGameShown(): EventStream<void> {
    return this._miniGameShownDispatcher.eventStream;
  }

  get miniGameFinishedDispatcher(): EventDispatcher<BonusFinishedArgs> {
    return this._miniGameFinishedDispatcher;
  }

  get miniGameUpdatedDispatcher(): EventDispatcher<IBonusRound> {
    return this._miniGameUpdatedDispatcher;
  }

  get onMiniGameFinishedEvent(): EventStream<BonusFinishedArgs> {
    return this._miniGameFinishedDispatcher.eventStream;
  }

  get onMiniGameUpdatedEvent(): EventStream<IBonusRound> {
    return this._miniGameUpdatedDispatcher.eventStream;
  }

  get miniGameCreatedDispatcher(): EventDispatcher<IBonusGame> {
    return this._miniGameCreatedDispatcher;
  }

  get onMiniGameCreated(): EventStream<IBonusGame> {
    return this._miniGameCreatedDispatcher.eventStream;
  }

  abstract get bonusResponse(): IBonusResponse | null;

  abstract get resourceManager(): IResourceManager;

  abstract get miniGameService(): IMiniGameService;

  get bonusHolder(): SceneObject {
    return this._bonusHolder;
  }

  set set_bonusHolder(value: SceneObject) {
    this._bonusHolder = value;
  }

  OnStateEntered(slotState: string): void {
    if (slotState === this._stateId) {
      this.startBonus();
    }
  }

  startBonus(): void {
    if (
      this.bonusResponse &&
      (!this._gameTypes || this._gameTypes.includes(this.bonusResponse.type))
    ) {
      this._cancellationTokenSource = new CancellationTokenSource();
      this._bonusHolder =
        this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).bonusHolder;
      const bonusId = this._gameTypeToBonusId.has(this.bonusResponse.type)
        ? this._gameTypeToBonusId.get(this.bonusResponse.type)!
        : '';
      const config = this._sceneCommon.resourceCache.getResource<JSONResource>(
        JSONResource.TypeId,
        `config/${this.getConfigTemplateWithFallback(
          this._sceneCommon.resourceCache as ResourceCache,
          bonusId
        )}`
      )!.data;
      const configuration = BonusConfiguration.fromJson(config!);
      const bonusContext = new BonusContext();
      bonusContext.storageRepositoryProvider =
        this._container.forceResolve<IStorageRepositoryProvider>(T_IStorageRepositoryProvider);
      const root = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
      const externalScenes = this._externalScenesIds
        ? (this._externalScenesIds.map((id) => root.findById(id)) as SceneObject[])
        : null;
      this._bonusScene = new BonusScene(
        this._bonusHolder,
        configuration,
        this.resourceManager,
        bonusContext,
        externalScenes,
        this._cancellationTokenSource.token,
        this
      );
      this._bonusGame = new BonusGame(
        this._bonusScene,
        this.miniGameService,
        bonusContext,
        this.updateBonusFinishPropertiesWithCurrent(),
        this.bonusResponse.type,
        this._cancellationTokenSource.token
      );
      this._miniGameCreatedDispatcher.dispatchEvent(this._bonusGame);

      this._serverException = this._bonusGame.onServerException.listen(() => {
        this._serverException.cancel();
        this.onServerExceptionInternal();
      });
      this._finishingSub = this._bonusScene.bonusFinishing.listen(() => {
        this._finishingSub.cancel();
        this.onMiniGameFinishingInternal();
      });
      this._shownSub = this._bonusScene.bonusShown.listen(() => {
        this._shownSub.cancel();
        this._miniGameShownDispatcher.dispatchEvent();
        this.onMiniGameStartedInternal();
      });
      this._finishedSub = this._bonusScene.bonusFinished.listen(() => {
        this._finishedSub.cancel();
        this.onMiniGameFinishedInternal();
      });
      this._updatedSub = this._bonusScene.bonusUpdated.listen(() => {
        this._updatedSub.cancel();
        this.onMiniGameUpdatedInternal();
      });

      this._bonusGame.start(this.bonusResponse);
    }
  }

  removeWinIcons(positions: ReelWinPosition[], types: string[]): ReelWinPosition[] {
    const find = positions.find((pos) => types.includes(pos.type));
    if (find) {
      positions.splice(positions.indexOf(find), 1);
    }
    return positions;
  }

  getConfigTemplate(_miniGameId: string = ''): string {
    return '';
  }

  getConfigTemplateWithFallback(resourceCache: ResourceCache, miniGameId: string = ''): string {
    return this.getConfigTemplate(miniGameId);
  }

  OnStateExited(_slotState: string): void {}

  onMiniGameFinishing(): void {}

  onMiniGameFinished(): void {
    this.dispose();
  }

  onMiniGameStarted(): void {}

  onMiniGameUpdated(): void {}

  async onServerExceptionInternal(): Promise<void> {
    await this._container
      .forceResolve<ISomethingWentWrongShower>(T_ISomethingWentWrongShower)
      .showSomethingWentWrong();
    this._container
      .forceResolve<IGameNavigator>(T_IGameNavigator)
      .completeGame(new BackToLobbyGameResult());
  }

  onMiniGameFinishingInternal(): void {
    this._miniGameFinishedDispatcher.dispatchEvent(this.bonusGame!.finishArgs);
    this.onMiniGameFinishing();

    if (this._hideSlot) {
      this._resourcesComponent.slot.enable();
    }
    if (this._hideHud) {
      this._resourcesComponent.footer.enable();
    }
  }

  onMiniGameFinishedInternal(): void {
    this._disposeInternal(false);
    this.onMiniGameFinished();
  }

  onMiniGameStartedInternal(): void {
    this._navigationStack.register(this);
    this.onMiniGameStarted();

    if (this._hideSlot) {
      this._resourcesComponent.slot.disable();
    }
    if (this._hideHud) {
      this._resourcesComponent.footer.disable();
    }
  }

  onMiniGameUpdatedInternal(): void {
    this._miniGameUpdatedDispatcher.dispatchEvent(this.bonusGame!.bonusResponse.currentRound!);
    this.onMiniGameUpdated();
  }

  dispose(): void {
    this._disposeInternal(true);
  }

  private _disposeInternal(interrupt: boolean): void {
    if (this._cancellationTokenSource) {
      if (interrupt) {
        this._cancellationTokenSource.cancel();
      }
    }
    if (this._bonusScene) {
      this._shownSub.cancel();
      this._finishingSub.cancel();
      this._finishedSub.cancel();
      if (interrupt) {
        this._bonusScene.interruptBonus();
      }
      this._bonusScene.dispose();
      this._bonusScene = null;
    }
    if (this._bonusGame) {
      this._bonusGame.dispose();
      this._bonusGame = null;
    }
    this._navigationStack.unregister(this);
  }

  handleBackKey(): boolean {
    return false;
  }

  updateBonusFinishPropertiesWithCurrent(): Func3<
    IBonusResponse,
    Map<string, any>,
    Map<string, any>,
    void
  > | null {
    return null;
  }

  async processBeforeBonusFinishEvent(): Promise<void> {
    if (!this._bonusExternalEventAsyncProcessor) {
      return;
    }
    return this._bonusExternalEventAsyncProcessor.processActionsBeforeBonusClose(
      this.bonusGame!.bonusResponse
    );
  }

  async processAfterBonusFinishEvent(): Promise<void> {
    if (!this._bonusExternalEventAsyncProcessor) {
      return;
    }
    return this._bonusExternalEventAsyncProcessor.processActionsAfterBonusClose(
      this.bonusGame!.bonusResponse
    );
  }

  async processBeforeBonusUpdatedEvent(): Promise<void> {
    if (!this._bonusExternalEventAsyncProcessor) {
      return;
    }
    return this._bonusExternalEventAsyncProcessor.processActionsBeforeBonusUpdate(
      this.bonusGame!.bonusResponse
    );
  }
}
