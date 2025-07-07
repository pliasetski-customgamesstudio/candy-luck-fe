import {
  BonusScreenMessage,
  ChangeRoundMessage,
  RoundMessage,
  RoundMessageType,
  ChangeRoundType,
  BonusContext,
  IBonusResponse,
  MessagingConstants,
} from '@cgs/common';
import { Func3 } from '@cgs/shared';
import { IBonusMessageResolver } from '../interfaces/i_bonus_message_resolver';
import { RoundResolverFactory } from './round/round_resolver_factory';

export class BonusMessageResolver implements IBonusMessageResolver {
  private _resolverFactory: RoundResolverFactory = new RoundResolverFactory();
  public get resolverFactory(): RoundResolverFactory {
    return this._resolverFactory;
  }
  public set resolverFactory(value: RoundResolverFactory) {
    this._resolverFactory = value;
  }
  private _bonusContext: BonusContext;
  public get bonusContext(): BonusContext {
    return this._bonusContext;
  }
  private _additionalProperties: Map<string, any> = new Map<string, any>();

  private _updateBonusFinishPropertiesWithCurrent: Func3<
    IBonusResponse,
    Map<string, any>,
    Map<string, any>,
    void
  > | null;
  public get updateBonusFinishPropertiesWithCurrent(): Func3<
    IBonusResponse,
    Map<string, any>,
    Map<string, any>,
    void
  > | null {
    return this._updateBonusFinishPropertiesWithCurrent;
  }

  constructor(
    bonusContext: BonusContext,
    updateBonusFinishPropertiesWithCurrent: Func3<
      IBonusResponse,
      Map<string, any>,
      Map<string, any>,
      void
    > | null
  ) {
    this._bonusContext = bonusContext;
    this._updateBonusFinishPropertiesWithCurrent = updateBonusFinishPropertiesWithCurrent;
  }

  public startBonus(bonusResponse: IBonusResponse): BonusScreenMessage[] {
    const messages: BonusScreenMessage[] = [];
    const resolver = this._resolverFactory.resolver(bonusResponse.currentRound!.roundType);
    let roundProperties: Map<string, any>;

    // Whether it is restore
    if (bonusResponse.bonusStarted) {
      roundProperties = bonusResponse.result
        ? resolver.properties(this._bonusContext, bonusResponse.currentRound!, bonusResponse.result)
        : resolver.roundProperties(this._bonusContext, bonusResponse.currentRound!);
      this.baseProperties(roundProperties, bonusResponse);
      const changeRoundMessage = new ChangeRoundMessage(ChangeRoundType.Next);
      changeRoundMessage.nextRoundProperties = roundProperties;
      messages.push(changeRoundMessage);
    } else {
      if (bonusResponse.previousRounds) {
        for (const round of bonusResponse.previousRounds) {
          const prevResolver = this._resolverFactory.resolver(round.roundType);

          const prevProperties = prevResolver.roundProperties(this._bonusContext, round);
          this.baseProperties(prevProperties, bonusResponse, true);
          this._bonusContext.add(round.roundNumber, prevProperties);
        }
      }
      roundProperties = resolver.properties(
        this._bonusContext,
        bonusResponse.currentRound!,
        bonusResponse.result
      );
      this.baseProperties(roundProperties, bonusResponse, true);
      const changeRoundMessage1 = new ChangeRoundMessage(
        ChangeRoundType.Specific,
        bonusResponse.currentRound!.roundNumber,
        true
      );
      changeRoundMessage1.nextRoundProperties = roundProperties;
      messages.push(changeRoundMessage1);
      messages.push(RoundMessage.fromProperties(RoundMessageType.Restore, roundProperties));
    }
    this._bonusContext.add(bonusResponse.currentRound!.roundNumber, roundProperties);

    return messages;
  }

  public updateBonus(bonusResponse: IBonusResponse): BonusScreenMessage[] {
    const messages: BonusScreenMessage[] = [];

    const roundResolver = this._resolverFactory.resolver(bonusResponse.currentRound!.roundType);
    const roundMessage = roundResolver.message(
      this._bonusContext,
      bonusResponse.currentRound!,
      bonusResponse.result
    );
    const roundProperties = roundMessage.properties;
    this.baseProperties(roundProperties, bonusResponse);
    this._bonusContext.add(bonusResponse.currentRound!.roundNumber, roundProperties);
    messages.push(roundMessage);

    const afterWinMessage = RoundMessage.fromProperties(
      RoundMessageType.AfterWin,
      roundResolver.properties(
        this._bonusContext,
        bonusResponse.currentRound!,
        bonusResponse.result
      )
    );
    const afterWinProperties = afterWinMessage.properties;
    this.baseProperties(afterWinProperties, bonusResponse);
    messages.push(afterWinMessage);

    if (
      bonusResponse.nextRound &&
      bonusResponse.nextRound.roundNumber > bonusResponse.currentRound!.roundNumber
    ) {
      // Go to the next round
      const nextRoundResolver = this._resolverFactory.resolver(bonusResponse.nextRound.roundType);
      const nextRoundProperties = nextRoundResolver.properties(
        this._bonusContext,
        bonusResponse.nextRound,
        bonusResponse.result
      );
      this.baseProperties(nextRoundProperties, bonusResponse);
      this._bonusContext.add(bonusResponse.nextRound.roundNumber, nextRoundProperties);
      const changeRoundMessage = new ChangeRoundMessage(
        ChangeRoundType.Next,
        bonusResponse.nextRound.roundNumber
      );
      changeRoundMessage.currentRoundProperties = roundProperties;
      changeRoundMessage.nextRoundProperties = nextRoundProperties;
      messages.push(changeRoundMessage);
    }

    if (bonusResponse.bonusFinished) {
      // Bonus is finished however we must check whether more round available that doesn't require server (e.g. Finish Bonus popup)
      const curProperties = roundResolver.properties(
        this._bonusContext,
        bonusResponse.currentRound!,
        bonusResponse.result
      );
      this.baseProperties(curProperties, bonusResponse);
      const finishProperties = roundResolver.resultProperties(
        this._bonusContext,
        bonusResponse.result
      );
      this.baseProperties(finishProperties, bonusResponse);
      if (this._updateBonusFinishPropertiesWithCurrent) {
        this._updateBonusFinishPropertiesWithCurrent(
          bonusResponse,
          finishProperties,
          curProperties
        );
      }
      const changeRoundMessage1 = new ChangeRoundMessage(ChangeRoundType.Next);
      changeRoundMessage1.currentRoundProperties = curProperties;
      changeRoundMessage1.nextRoundProperties = finishProperties;
      messages.push(changeRoundMessage1);
    }

    return messages;
  }

  protected baseProperties(
    props: Map<string, any>,
    bonusResponse: IBonusResponse,
    bonusRecovery: boolean = false
  ): void {
    props.set(MessagingConstants.bonusRecovery, bonusRecovery ? 'True' : 'False');
    props.set(MessagingConstants.bonusFinished, bonusResponse.bonusFinished ? 'True' : 'False');
    props.set(MessagingConstants.bonusStarted, bonusResponse.bonusStarted ? 'True' : 'False');
    props.set(MessagingConstants.bonusType, bonusResponse.bonusType);
    const winName = bonusResponse.result?.winName || '';
    props.set(MessagingConstants.winName, winName);
    props.set(MessagingConstants.type, bonusResponse.type || '');
    this._additionalProperties.forEach((value, key) => props.set(key, value));
  }

  public addProperties(addProps: Map<string, any>): void {
    addProps.forEach((value, key) => this._additionalProperties.set(key, value));
  }

  public clearProperties(): void {
    this._additionalProperties.clear();
  }
}
