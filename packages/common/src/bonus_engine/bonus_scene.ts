import { IBonusScene } from './i_bonus_scene';
import { IConfiguration } from './configuration/elements/i_configuration';
import { EventDispatcher, EventStream, IStreamSubscription, SceneObject } from '@cgs/syd';
import { IResourceManager } from './resources/i_resource_manager';
import { IRound } from './i_round';
import { SharedResources } from './shared_resources';
import { ExecutionQueue } from './utils/execution_queue';
import { BonusScreenMessage } from './messaging/bonus_message';
import { BonusContext } from './messaging/bonus_context';
import { CancellationToken } from '../future/cancellation_token';
import { IBonusEventAsyncProcessor } from './i_bonus_event_async_processor';
import { SelectionArgs } from './messaging/selection_args';
import { ChangeRoundMessage } from './messaging/change_round_message';
import { MessagingConstants } from './messaging/messaging_constants';
import { RoundMessage } from './messaging/round_message';
import { RoundMessageType } from './enums/round_message_type';
import { ChangeRoundType } from './enums/change_round_type';
import { RoundConfiguration } from './configuration/elements/round_configuration';
import { Round } from './round';
import { SelectAction } from './enums/select_action';
import { RoundType } from './enums/round_type';

export class BonusScene implements IBonusScene {
  public waitingUserInteraction: boolean;

  private _configuration: IConfiguration;
  private _parent: SceneObject;
  private _resourceManager: IResourceManager;
  private _round: IRound | null = null;
  private _prevRound: IRound | null = null;
  private _sharedResources: SharedResources | null = null;
  private _localRoundIndex: number = -1;
  private _processingQueue: ExecutionQueue<BonusScreenMessage>[];
  private _roundSubscription: IStreamSubscription | null = null;
  private _bonusContext: BonusContext;
  private _currentProperties: Map<string, any>;
  private _token: CancellationToken;
  private _externalScenes: SceneObject[];
  private _bonusEventAsyncProcessor: IBonusEventAsyncProcessor | null;
  private _selectController: EventDispatcher<SelectionArgs> = new EventDispatcher<SelectionArgs>();
  private _bonusFinishingController: EventDispatcher<void> = new EventDispatcher();
  private _bonusShownController: EventDispatcher<void> = new EventDispatcher();
  private _bonusFinishedController: EventDispatcher<void> = new EventDispatcher();
  private _bonusUpdatedController: EventDispatcher<void> = new EventDispatcher();
  private _winStartedController: EventDispatcher<void> = new EventDispatcher();

  constructor(
    parent: SceneObject,
    configuration: IConfiguration,
    resourceManager: IResourceManager,
    bonusContext: BonusContext,
    externalScenes: SceneObject[] | null,
    token: CancellationToken,
    bonusEventAsyncProcessor: IBonusEventAsyncProcessor | null = null
  ) {
    this._parent = parent;
    this._configuration = configuration;
    this._resourceManager = resourceManager;
    this._bonusContext = bonusContext;
    this._externalScenes = externalScenes || [];
    this._token = token;
    this._bonusEventAsyncProcessor = bonusEventAsyncProcessor;
    this._processingQueue = new Array<ExecutionQueue<BonusScreenMessage>>();
    this._sharedResources = new SharedResources(
      this._parent,
      this._configuration.sharedResources,
      this._resourceManager
    );
    this.waitingUserInteraction = true;
  }

  get parent(): SceneObject {
    return this._parent;
  }

  get select(): EventStream<SelectionArgs> {
    return this._selectController.eventStream;
  }

  get bonusFinishing(): EventStream<void> {
    return this._bonusFinishingController.eventStream;
  }

  get bonusShown(): EventStream<void> {
    return this._bonusShownController.eventStream;
  }

  get bonusFinished(): EventStream<void> {
    return this._bonusFinishedController.eventStream;
  }

  get bonusUpdated(): EventStream<void> {
    return this._bonusUpdatedController.eventStream;
  }

  get winStarted(): EventStream<void> {
    return this._winStartedController.eventStream;
  }

  queueMessages(messages: BonusScreenMessage[]): void {
    if (messages.some((message) => message instanceof ChangeRoundMessage)) {
      if (this._round && this._round.interactiveRound && !this.waitingUserInteraction) {
        // Don't change scene if WaitingUserInteraction is false. Scene changing is already in progress.
        return;
      }
      const nextRoundMessage = messages.find(
        (msg) => msg instanceof ChangeRoundMessage
      ) as ChangeRoundMessage;

      // Check whether current scene includes next server index. Cancel change of scenes in that case.
      if (this._round && this._round.serverIndexes.includes(nextRoundMessage.roundIndex)) {
        const indexMessage = messages.indexOf(nextRoundMessage);
        messages.splice(indexMessage, 1);
        nextRoundMessage.nextRoundProperties.set(MessagingConstants.multipleRoundStart, 'True');
        messages.splice(
          indexMessage,
          0,
          RoundMessage.fromProperties(RoundMessageType.Start, nextRoundMessage.nextRoundProperties)
        );
      } else {
        this.waitingUserInteraction = false;
        if (this._round) {
          this._round.disableInteraction();
        }
      }
    }

    const processQueue = new ExecutionQueue(this.processMessage.bind(this), this._token);
    for (const message of messages) {
      processQueue.add(message);
    }
    this._processingQueue.push(processQueue);
  }

  roundIndex(): number {
    return this._localRoundIndex;
  }

  serverIndexes(): number[] {
    return this._round?.serverIndexes || [];
  }

  async processMessage(message: BonusScreenMessage): Promise<void> {
    if (message instanceof ChangeRoundMessage) {
      const changeRoundMessage: ChangeRoundMessage = message;
      if (this._round) {
        await this.processMessage(
          RoundMessage.fromProperties(
            RoundMessageType.Finish,
            changeRoundMessage.currentRoundProperties
          )
        );
        this._token.throwIfCancellationRequested();
      }
      let nextRoundAvailable = false;
      switch (changeRoundMessage.type) {
        case ChangeRoundType.Next:
          nextRoundAvailable = this.prepareNextRound(this.getNextRoundIndex(message), false);
          break;
        case ChangeRoundType.Specific:
          nextRoundAvailable = this.prepareNextRound(
            changeRoundMessage.roundIndex,
            changeRoundMessage.isServerIndex
          );
          break;
      }
      if (nextRoundAvailable) {
        await this.processMessage(
          RoundMessage.fromProperties(RoundMessageType.Init, changeRoundMessage.nextRoundProperties)
        );
        this._token.throwIfCancellationRequested();
        await this.processMessage(
          RoundMessage.fromProperties(
            RoundMessageType.Start,
            changeRoundMessage.nextRoundProperties
          )
        );
        this._token.throwIfCancellationRequested();
      } else {
        if (this._bonusEventAsyncProcessor) {
          await this._bonusEventAsyncProcessor.processBeforeBonusFinishEvent();
        }
        this._bonusFinishingController.dispatchEvent();
        this._round = null;
        if (this._prevRound) {
          await this._prevRound.hide();
          this._token.throwIfCancellationRequested();
        }
        if (this._bonusEventAsyncProcessor) {
          await this._bonusEventAsyncProcessor.processAfterBonusFinishEvent();
        }
        this._bonusFinishedController.dispatchEvent();
      }
      return;
    } else if (message instanceof RoundMessage && this._round) {
      this._currentProperties = message.properties;
      if (message.type === RoundMessageType.Win) {
        this._winStartedController.dispatchEvent();
      }
      await this._round.processMessage(message);
      this._token.throwIfCancellationRequested();
      if (message.type === RoundMessageType.Init) {
        await this._switchToNextRound();
        this._token.throwIfCancellationRequested();
      }
      if (message.type === RoundMessageType.Lose || message.type === RoundMessageType.Win) {
        if (this._bonusEventAsyncProcessor) {
          await this._bonusEventAsyncProcessor.processBeforeBonusUpdatedEvent();
        }
        this._bonusUpdatedController.dispatchEvent();
      }
    }
  }

  prepareNextRound(roundIndex: number, isServerIndex: boolean): boolean {
    if (!this._round) {
      this._sharedResources?.load();
    }
    this._prevRound = this._round;
    if (this._roundSubscription) {
      this._roundSubscription.cancel();
      this._roundSubscription = null;
    }

    let screenConfig: RoundConfiguration | null = null;
    if (isServerIndex) {
      screenConfig =
        this._configuration.rounds.find((config) => config.serverIndexes.includes(roundIndex)) ??
        null;
      this._localRoundIndex = screenConfig ? this._configuration.rounds.indexOf(screenConfig) : -1;
    } else if (roundIndex < this._configuration.rounds.length) {
      screenConfig = this._configuration.rounds[roundIndex];
      this._localRoundIndex = roundIndex;
    }

    if (screenConfig) {
      const extScenes = this._sharedResources!.resourceScenes.concat(this._externalScenes);
      this._round = new Round(
        this._parent,
        extScenes,
        screenConfig,
        this._resourceManager,
        this._bonusContext,
        this._token
      );
      this._roundSubscription = this._round.select.listen((event) => this.onSelect(event!));
      this._round.load();
      //go to next round if round doesn't waiting for user input
      if (this._round && !this._round.interactiveRound) {
        const prevProperties = new Map<string, any>(this._bonusContext.getLast()?.entries());
        const changeRoundMessage = new ChangeRoundMessage(ChangeRoundType.Next);
        changeRoundMessage.currentRoundProperties = prevProperties;
        changeRoundMessage.nextRoundProperties = prevProperties;
        const additionalMessages = [changeRoundMessage];
        this.queueMessages(additionalMessages);
      }
      return true;
    }
    return false;
  }

  filterSelectedValues(key: string): any[] {
    const lastRoundProperties = this._bonusContext.getLast();
    if (lastRoundProperties) {
      return lastRoundProperties.get(key) || [];
    }

    return [];
  }

  private async _switchToNextRound(): Promise<void> {
    await this._round!.show();
    this.waitingUserInteraction = true;
    //Hide previous round after a new one is shown
    if (this._prevRound) {
      await this._prevRound.hide();
      this._token.throwIfCancellationRequested();
      this._prevRound.unload();
      this._prevRound = null;
    } else {
      this._bonusShownController.dispatchEvent();
    }
  }

  getNextRoundIndex(message: ChangeRoundMessage): number {
    let nextRoundIndex = this._localRoundIndex + 1;
    if (this._round && message.currentRoundProperties) {
      const selectedTypes = message.currentRoundProperties.get(MessagingConstants.selectedTypes);
      if (
        Array.isArray(selectedTypes) &&
        selectedTypes.length > 0 &&
        this._round.configuration.nextRoundMap[selectedTypes[0]] !== undefined
      ) {
        nextRoundIndex = this._round.configuration.nextRoundMap[selectedTypes[0]];
      }
    }
    return nextRoundIndex;
  }

  private _finishRound(props: Map<string, any> | null = null): void {
    if (!props) {
      props = new Map<string, any>(this._bonusContext.getLast()?.entries());
    }
    const changeRoundMessage = new ChangeRoundMessage(ChangeRoundType.Next);
    changeRoundMessage.currentRoundProperties = props;
    changeRoundMessage.nextRoundProperties = props;
    this.queueMessages([changeRoundMessage]);
  }

  private _skipRound(nextRoundIndex: number, props: Map<string, any> | null = null): void {
    if (!props) {
      props = new Map<string, any>(this._bonusContext.getLast()?.entries());
    }
    this._processingQueue.length = 0;
    this._round!.skipExecution();
    const changeRoundMessage = new ChangeRoundMessage(ChangeRoundType.Specific, nextRoundIndex);
    changeRoundMessage.nextRoundProperties = props;
    this.queueMessages([changeRoundMessage]);
  }

  private _interruptBonusInternal(): void {
    this._processingQueue.length = 0;
    if (this._round) {
      this._round.interrupt();
      this._round = null;
    }
    if (this._prevRound) {
      this._prevRound.interrupt();
      this._round = null;
    }
  }

  interruptBonus(): void {
    this._interruptBonusInternal();
  }

  skipBonus(): void {
    this._interruptBonusInternal();
    this._bonusFinishingController.dispatchEvent();
    this._bonusFinishedController.dispatchEvent();
  }

  onSelect(e: SelectionArgs): void {
    const prevProperties = this._currentProperties;
    prevProperties.set(MessagingConstants.selectedButtonsSet, e.buttonsSetName);
    prevProperties.set(MessagingConstants.clickedButtonIndex, e.selectedIndex);
    let message: RoundMessage;
    switch (e.selectAction) {
      case SelectAction.SendIndex:
      case SelectAction.SendValue:
        this._selectController.dispatchEvent(e);
        message = RoundMessage.fromProperties(RoundMessageType.Click, prevProperties);
        this._processingQueue[this._processingQueue.length - 1].add(message, true);
        break;
      case SelectAction.FinishRound:
        this._finishRound();
        break;
      case SelectAction.InterruptRound:
        const nextRound = this._configuration.rounds
          .slice(this._localRoundIndex + 1)
          .find((configuration) => configuration.type !== RoundType.Animation);
        if (nextRound) {
          this._skipRound(this._configuration.rounds.indexOf(nextRound));
        }
        break;
      default:
        message = RoundMessage.fromProperties(RoundMessageType.Click, prevProperties);
        this._processingQueue[this._processingQueue.length - 1].add(message, true);
        break;
    }
  }

  dispose(): void {
    if (this._prevRound) {
      this._prevRound.unload();
      this._prevRound = null;
    }
    if (this._round) {
      this._round.unload();
      this._round = null;
    }
    if (this._sharedResources) {
      this._sharedResources.unload();
      this._sharedResources = null;
    }
  }
}
