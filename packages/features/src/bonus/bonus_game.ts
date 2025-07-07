import { EventDispatcher, EventStream, IStreamSubscription } from '@cgs/syd';
import { IBonusGame, IMiniGameService } from './interfaces/i_bonus_game';
import { IBonusMessageResolver } from './interfaces/i_bonus_message_resolver';
import {
  BonusContext,
  BonusFinishedArgs,
  CancellationToken,
  ExecutionQueue,
  IBonusResponse,
  IBonusScene,
  InvalidSequenceNumberException,
  NoInternetException,
  RestartInitiatedException,
  SelectAction,
  SelectionArgs,
} from '@cgs/common';
import { Func3 } from '@cgs/shared';
import { BonusMessageResolver } from './resolvers/bonus_message_resolver';
import { ParseException, ServerException } from '@cgs/network';

export class BonusGame implements IBonusGame {
  private _bonusMessageResolver: IBonusMessageResolver;
  get bonusMessageResolver(): IBonusMessageResolver {
    return this._bonusMessageResolver;
  }
  set bonusMessageResolver(value: IBonusMessageResolver) {
    this._bonusMessageResolver = value;
  }
  private _bonusScene: IBonusScene;
  get bonusScene(): IBonusScene {
    return this._bonusScene;
  }
  private _bonusService: IMiniGameService;
  get bonusService(): IMiniGameService {
    return this._bonusService;
  }
  private selectSub: IStreamSubscription | null = null;
  private _sendingQueue: ExecutionQueue<SelectionArgs>;
  private _bonusContext: BonusContext;
  get bonusContext(): BonusContext {
    return this._bonusContext;
  }
  private _serverIndex: number;
  get serverIndex(): number {
    return this._serverIndex;
  }
  private _finishArgs: BonusFinishedArgs;
  private _bonusResponse: IBonusResponse;
  private _gameType: string;
  get gameType(): string {
    return this._gameType;
  }
  private _cancellationToken: CancellationToken;
  get cancellationToken(): CancellationToken {
    return this._cancellationToken;
  }
  private _updateBonusFinishPropertiesWithCurrent: Func3<
    IBonusResponse,
    Map<string, any>,
    Map<string, any>,
    void
  > | null;
  get updateBonusFinishPropertiesWithCurrent(): Func3<
    IBonusResponse,
    Map<string, any>,
    Map<string, any>,
    void
  > | null {
    return this._updateBonusFinishPropertiesWithCurrent;
  }
  private _bonusFinishedDispatcher: EventDispatcher<BonusFinishedArgs> =
    new EventDispatcher<BonusFinishedArgs>();
  get onBonusFinished(): EventStream<BonusFinishedArgs> {
    return this._bonusFinishedDispatcher.eventStream;
  }

  private _serverExceptionDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get onServerException(): EventStream<void> {
    return this._serverExceptionDispatcher.eventStream;
  }

  constructor(
    bonusScene: IBonusScene,
    bonusService: IMiniGameService,
    bonusContext: BonusContext,
    updateBonusFinishPropertiesWithCurrent: Func3<
      IBonusResponse,
      Map<string, any>,
      Map<string, any>,
      void
    > | null,
    gameType: string,
    cancellationToken: CancellationToken
  ) {
    this._bonusScene = bonusScene;
    this._bonusService = bonusService;
    this._bonusContext = bonusContext;
    this._updateBonusFinishPropertiesWithCurrent = updateBonusFinishPropertiesWithCurrent;
    this._gameType = gameType;
    this._cancellationToken = cancellationToken;
    this._sendingQueue = new ExecutionQueue<SelectionArgs>(
      (a) => this.sendToServer(a),
      this._cancellationToken
    );
    this._bonusMessageResolver = new BonusMessageResolver(
      this._bonusContext,
      this._updateBonusFinishPropertiesWithCurrent
    );
  }

  get finishArgs(): BonusFinishedArgs {
    return this._finishArgs;
  }
  get bonusResponse(): IBonusResponse {
    return this._bonusResponse;
  }

  start(bonusResponse: IBonusResponse): void {
    this._bonusResponse = bonusResponse;
    this._serverIndex = bonusResponse.currentRound!.roundNumber;
    this.selectSub = this._bonusScene.select.listen((arg) => {
      this.onSelect(arg);
    });
    this._bonusScene.queueMessages(this._bonusMessageResolver.startBonus(bonusResponse));
  }

  stop(): void {
    this.selectSub?.cancel();
    this._sendingQueue.clear();
  }

  onSelect(e: SelectionArgs): void {
    this._sendingQueue.add(e);
  }

  async sendToServer(e: SelectionArgs): Promise<void> {
    if (
      this._bonusScene.waitingUserInteraction &&
      this._bonusScene.serverIndexes().includes(this._serverIndex) &&
      this._serverIndex == e.serverIndex
    ) {
      try {
        const response = await this._bonusService.send(
          e.selectAction == SelectAction.SendValue ? e.sendValue! : e.selectedIndex!,
          this._serverIndex,
          this._gameType
        );
        this._cancellationToken.throwIfCancellationRequested();
        await this.onResponse(response!);
      } catch (e) {
        if (
          e instanceof NoInternetException ||
          e instanceof RestartInitiatedException ||
          e instanceof ServerException ||
          e instanceof ParseException ||
          e instanceof InvalidSequenceNumberException
        ) {
          this.onException();
        }
      }
    }
  }

  async onException(): Promise<void> {
    this._sendingQueue.clear();
    this._serverExceptionDispatcher.dispatchEvent();
  }

  async onResponse(bonusResponse: IBonusResponse): Promise<void> {
    this._bonusResponse = bonusResponse;
    if (bonusResponse.nextRound) {
      this._serverIndex = bonusResponse.nextRound.roundNumber;
    }

    //await this._checkForParlay(bonusResponse);

    if (bonusResponse.bonusFinished) {
      this._finishArgs = this.extractFinishArgs(bonusResponse);
      this._bonusFinishedDispatcher.dispatchEvent(this._finishArgs);
    }

    const messages = this._bonusMessageResolver.updateBonus(bonusResponse);
    this._bonusScene.queueMessages(messages);
  }

  //  async _checkForParlay(bonusResponse: IBonusResponse): Promise<void> {
  //    if ((this._gameType=="gamble" || this._gameType=="gambleScatter") && !bonusResponse.bonusFinished && bonusResponse.userParlayInfo.isUserParlayFinished) {
  //      const collectResponse = await this._bonusService.send(bonusResponse.currentRound!.notSelectedButtons.length + 1, this._serverIndex, this._gameType);
  //      bonusResponse.bonusFinished = true;
  //      this._cancellationToken.throwIfCancellationRequested();
  //    }
  //  }

  extractFinishArgs(bonusResponse: IBonusResponse): BonusFinishedArgs {
    if (bonusResponse.currentRound!.selectedButtons!.length > 0) {
      const lastSelected =
        bonusResponse.currentRound!.selectedButtons![
          bonusResponse.currentRound!.selectedButtons!.length - 1
        ];
      return new BonusFinishedArgs(
        bonusResponse,
        lastSelected.value,
        lastSelected.view,
        lastSelected.type,
        bonusResponse.result!.totalWin,
        bonusResponse.result!.bonusWin
      );
    }
    return BonusFinishedArgs.empty();
  }

  addProperties(properties: Map<string, any>): void {
    this._bonusMessageResolver.addProperties(properties);
  }

  clearProperties(): void {
    this._bonusMessageResolver.clearProperties();
  }

  dispose(): void {
    this.stop();
  }
}
