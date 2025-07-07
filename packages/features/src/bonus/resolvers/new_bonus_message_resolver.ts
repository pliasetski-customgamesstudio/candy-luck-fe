import {
  BonusContext,
  BonusScreenMessage,
  ChangeRoundMessage,
  ChangeRoundType,
  IBonusResponse,
  IConfiguration,
  MessagingConstants,
  RoundMessage,
  RoundMessageType,
} from '@cgs/common';
import { Func3 } from '@cgs/shared';
import { BonusMessageResolver } from './bonus_message_resolver';

export class NewBonusMessageResolver extends BonusMessageResolver {
  private _configuration: IConfiguration;

  constructor(
    bonusContext: BonusContext,
    updateBonusFinishPropertiesWithCurrent: Func3<
      IBonusResponse,
      Map<string, any>,
      Map<string, any>,
      void
    > | null,
    configuration: IConfiguration
  ) {
    super(bonusContext, updateBonusFinishPropertiesWithCurrent);
    this._configuration = configuration;
  }

  updateBonus(bonusResponse: IBonusResponse): BonusScreenMessage[] {
    const messages: BonusScreenMessage[] = [];

    const roundResolver = this.resolverFactory.resolver(bonusResponse.currentRound!.roundType);
    const roundMessage = roundResolver.message(
      this.bonusContext,
      bonusResponse.currentRound!,
      bonusResponse.result
    );
    const roundProperties = roundMessage.properties;
    this.baseProperties(roundProperties, bonusResponse);
    this.bonusContext.add(bonusResponse.currentRound!.roundNumber, roundProperties);
    messages.push(roundMessage);

    const afterWinMessage = RoundMessage.fromProperties(
      RoundMessageType.AfterWin,
      roundResolver.properties(this.bonusContext, bonusResponse.currentRound!, bonusResponse.result)
    );
    const afterWinProperties = afterWinMessage.properties;
    this.baseProperties(afterWinProperties, bonusResponse);
    messages.push(afterWinMessage);

    if (
      bonusResponse.nextRound &&
      bonusResponse.nextRound.roundNumber > bonusResponse.currentRound!.roundNumber
    ) {
      //Go to the next round
      const nextRoundResolver = this.resolverFactory.resolver(bonusResponse.nextRound.roundType);
      const nextRoundProperties = nextRoundResolver.properties(
        this.bonusContext,
        bonusResponse.nextRound,
        bonusResponse.result
      );
      this.baseProperties(nextRoundProperties, bonusResponse);
      this.bonusContext.add(bonusResponse.nextRound.roundNumber, nextRoundProperties);

      const round = this._configuration.rounds.find((x) =>
        x.serverIndexes.includes(bonusResponse.nextRound!.roundNumber)
      );
      if (round) {
        const changeRoundMessage = new ChangeRoundMessage(
          ChangeRoundType.Specific,
          this._configuration.rounds.indexOf(round)
        );
        changeRoundMessage.currentRoundProperties = roundProperties;
        changeRoundMessage.nextRoundProperties = nextRoundProperties;
        messages.push(changeRoundMessage);
      } else {
        const changeRoundMessage1 = new ChangeRoundMessage(
          ChangeRoundType.Next,
          bonusResponse.nextRound.roundNumber
        );
        changeRoundMessage1.currentRoundProperties = roundProperties;
        changeRoundMessage1.nextRoundProperties = nextRoundProperties;
        messages.push(changeRoundMessage1);
      }
    }

    if (bonusResponse.bonusFinished) {
      //Bonus is finished however we must check whether more round available that doesn't require server (e.g. Finish Bonus popup)
      const curProperties = roundResolver.properties(
        this.bonusContext,
        bonusResponse.currentRound!,
        bonusResponse.result
      );
      curProperties.set(
        MessagingConstants.previousRoundNumber,
        bonusResponse.currentRound!.roundNumber
      );
      this.baseProperties(curProperties, bonusResponse);
      const finishProperties = roundResolver.resultProperties(
        this.bonusContext,
        bonusResponse.result
      );
      finishProperties.set(
        MessagingConstants.previousRoundNumber,
        bonusResponse.currentRound!.roundNumber
      );
      this.baseProperties(finishProperties, bonusResponse);
      if (this.updateBonusFinishPropertiesWithCurrent) {
        this.updateBonusFinishPropertiesWithCurrent(bonusResponse, finishProperties, curProperties);
      }

      if (bonusResponse.currentRound!.roundNumber != this._configuration.rounds.length - 1) {
        const changeRoundMessage2 = new ChangeRoundMessage(
          ChangeRoundType.Specific,
          this._configuration.rounds.length - 1
        );
        changeRoundMessage2.currentRoundProperties = curProperties;
        changeRoundMessage2.nextRoundProperties = finishProperties;
        messages.push(changeRoundMessage2);
      } else {
        const changeRoundMessage3 = new ChangeRoundMessage(ChangeRoundType.Next);
        changeRoundMessage3.currentRoundProperties = curProperties;
        changeRoundMessage3.nextRoundProperties = finishProperties;
        messages.push(changeRoundMessage3);
      }
    }

    return messages;
  }
}
