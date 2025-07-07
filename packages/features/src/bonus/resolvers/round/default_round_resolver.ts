import { Random } from '@cgs/syd';
import {
  BonusContext,
  IBonusResult,
  IBonusRound,
  MessagingConstants,
  NumberFormatter,
  RoundMessage,
  RoundMessageType,
} from '@cgs/common';
import { IRoundMessageResolver } from '../../interfaces/i_round_message_resolver';

export class DefaultRoundResolver implements IRoundMessageResolver {
  protected _random: Random = new Random();

  message(
    bonusContext: BonusContext,
    bonusRound: IBonusRound,
    bonusResult: IBonusResult
  ): RoundMessage {
    const type =
      bonusRound && bonusRound.selectedButtons && bonusRound.selectedButtons.length > 0
        ? RoundMessageType.Win
        : RoundMessageType.None;
    return RoundMessage.fromProperties(
      type,
      this.properties(bonusContext, bonusRound, bonusResult)
    );
  }

  properties(
    bonusContext: BonusContext,
    bonusRound: IBonusRound,
    bonusResult: IBonusResult
  ): Map<string, any> {
    const properties: Map<string, any> = new Map();

    if (bonusRound) {
      this.roundProperties(bonusContext, bonusRound).forEach((val, key) => {
        properties.set(key, val);
      });
    }
    if (bonusResult) {
      this.resultProperties(bonusContext, bonusResult).forEach((val, key) => {
        properties.set(key, val);
      });
    }

    return properties;
  }

  roundProperties(bonusContext: BonusContext, bonusRound: IBonusRound): Map<string, any> {
    const properties: Map<string, any> = new Map();
    if (bonusRound.paytable) {
      for (const type of bonusRound.paytable.map((r) => r.type)) {
        const group = bonusRound.paytable.filter((p) => p.type === type);
        properties.set(
          `${type}.${MessagingConstants.paytableIndexesKey}`,
          group.map((p) => p.index)
        );
        properties.set(
          `${type}.${MessagingConstants.paytableValuesKey}`,
          group.map((p) => NumberFormatter.format(p.value))
        );
        properties.set(
          `${type}.${MessagingConstants.paytableTotalValuesKey}`,
          group.map((p) => NumberFormatter.format(p.totalValue))
        );
      }
      properties.set(
        `${MessagingConstants.PaytableTypeKey}`,
        bonusRound.paytable.map((p) => p.type)
      );
      properties.set(
        `${MessagingConstants.paytableIndexesKey}`,
        bonusRound.paytable.map((p) => p.index)
      );
      properties.set(
        `${MessagingConstants.paytableValuesKey}`,
        bonusRound.paytable.map((p) => NumberFormatter.format(p.value))
      );
      properties.set(
        `${MessagingConstants.paytableTotalValuesKey}`,
        bonusRound.paytable.map((p) => NumberFormatter.format(p.totalValue))
      );
    }

    properties.set(MessagingConstants.attempts, bonusRound.attemps);
    properties.set(
      MessagingConstants.nextAttempts,
      bonusRound.attemps > 0 ? bonusRound.attemps - 1 : 0
    );
    properties.set(MessagingConstants.attemptsUsed, bonusRound.attempsUsed);

    let sample = bonusRound.selectedButtons
      ? bonusRound.selectedButtons.filter((button) => button.index >= 0)
      : [];
    properties.set(
      MessagingConstants.selectedValues,
      sample.map((button) => NumberFormatter.format(button.value))
    );
    properties.set(
      MessagingConstants.selectedTotalValues,
      sample.map((button) => NumberFormatter.format(button.totalValue))
    );
    properties.set(
      MessagingConstants.selectedIndexes,
      sample.map((button) => button.index)
    );
    properties.set(
      MessagingConstants.selectedTypes,
      sample.map((button) => button.type)
    );
    properties.set(
      MessagingConstants.selectedRoutingIndexes,
      sample.map((button) => button.routingIndex)
    );

    const views = sample.map((button) => button.view).filter((s) => !!s);
    if (views.length > 0) {
      properties.set(MessagingConstants.selectedViews, views);
    }

    if (sample.length > 0) {
      properties.set(MessagingConstants.firstSelectedIndex, sample[0].index);
      properties.set(MessagingConstants.lastSelectedIndex, sample[sample.length - 1].index);
      properties.set(
        MessagingConstants.firstSelectedValue,
        NumberFormatter.format(sample[0].value)
      );
      properties.set(
        MessagingConstants.lastSelectedValue,
        NumberFormatter.format(sample[sample.length - 1].value)
      );
      properties.set(MessagingConstants.lastSelectedView, sample[sample.length - 1].view);
      properties.set(MessagingConstants.firstSelectedView, sample[0].view);
      properties.set(MessagingConstants.firstSelectedType, sample[0].type);
      properties.set(MessagingConstants.lastSelectedType, sample[sample.length - 1].type);
      properties.set(
        MessagingConstants.firstSelectedTotalValue,
        NumberFormatter.format(sample[0].totalValue)
      );
      properties.set(
        MessagingConstants.lastSelectedTotalValue,
        NumberFormatter.format(sample[sample.length - 1].totalValue)
      );
      properties.set(
        MessagingConstants.firstSelectedRoutingIndex,
        NumberFormatter.format(sample[0].routingIndex)
      );
      properties.set(
        MessagingConstants.lastSelectedRoutingIndex,
        NumberFormatter.format(sample[sample.length - 1].routingIndex)
      );
    }

    const propKeys = sample
      .filter((button) => !!button.extraValues)
      .flatMap((props) => props.extraValues)
      .map((gain) => gain.type);
    for (const propKey of [...new Set(propKeys)]) {
      properties.set(
        `${propKey}.${MessagingConstants.selectedExtraValues}`,
        sample
          .filter((props) => !!props.extraValues)
          .map((button) => button.extraValues.find((gain) => gain.type === propKey) || null)
          .filter((gain) => !!gain)
          .map((gain) => gain!.value.toFixed(0))
      );
      properties.set(
        `${propKey}.${MessagingConstants.selectedIndexes}`,
        sample
          .filter((props) => props.extraValues?.some((gain) => gain.type === propKey))
          .map((button) => button.index)
      );
    }

    if (bonusRound.paytable) {
      const paytableExtra = bonusRound.paytable
        .filter((button) => !!button.extraValues)
        .flatMap((props) => props.extraValues)
        .map((gain) => gain.type);
      for (const propKey of paytableExtra) {
        properties.set(
          `${propKey}.${MessagingConstants.paytableExtraValuesKey}`,
          bonusRound.paytable
            .filter((props) => !!props.extraValues)
            .map((button) => button.extraValues.find((gain) => gain.type === propKey) || null)
            .filter((gain) => !!gain)
            .map((gain) => gain!.value.toFixed(0))
        );
        properties.set(
          `${propKey}.${MessagingConstants.paytableIndexesKey}`,
          bonusRound.paytable
            .filter((props) => props.extraValues?.some((gain) => gain.type === propKey))
            .map((button) => button.index)
        );
      }
    }

    sample = bonusRound.serverSelectedButtons
      ? bonusRound.serverSelectedButtons.filter((button) => button.index >= 0)
      : [];
    properties.set(
      MessagingConstants.serverSelectedValues,
      sample.map((button) => NumberFormatter.format(button.value))
    );
    properties.set(
      MessagingConstants.serverSelectedIndexes,
      sample.map((button) => button.index)
    );
    properties.set(
      MessagingConstants.serverSelectedTypes,
      sample.map((button) => button.type)
    );
    const serverViews = sample.map((button) => button.view).filter((s) => !!s);
    if (serverViews.length > 0) {
      properties.set(MessagingConstants.serverSelectedViews, serverViews);
    }

    sample = bonusRound.notSelectedButtons
      ? bonusRound.notSelectedButtons.filter((button) => button.index >= 0)
      : [];
    properties.set(
      MessagingConstants.notSelectedValues,
      sample.map((button) => NumberFormatter.format(button.value))
    );
    properties.set(
      MessagingConstants.notSelectedTotalValues,
      sample.map((button) => NumberFormatter.format(button.totalValue))
    );
    properties.set(
      MessagingConstants.notSelectedIndexes,
      sample.map((button) => button.index)
    );
    properties.set(
      MessagingConstants.notSelectedTypes,
      sample.map((button) => button.type)
    );
    properties.set(
      MessagingConstants.notSelectedRoutingIndexes,
      sample.map((button) => button.routingIndex)
    );

    if (sample.length > 0) {
      properties.set(
        MessagingConstants.randomNotSelectedIndex,
        sample[this._random.nextInt(sample.length)].index
      );
    }

    const notSelectedViews = sample.map((button) => button.view).filter((s) => !!s);
    if (notSelectedViews.length > 0) {
      properties.set(MessagingConstants.notSelectedViews, notSelectedViews);
    }

    const notSelectedPropKeys = sample
      .filter((button) => !!button.extraValues)
      .flatMap((props) => props.extraValues)
      .map((gain) => gain.type);
    for (const propKey of [...new Set(notSelectedPropKeys)]) {
      properties.set(
        `${propKey}.${MessagingConstants.notSelectedExtraValues}`,
        sample
          .filter((props) => !!props.extraValues)
          .map((button) => button.extraValues.find((gain) => gain.type === propKey) || null)
          .filter((gain) => !!gain)
          .map((gain) => gain!.value.toFixed(0))
      );
      properties.set(
        `${propKey}.${MessagingConstants.notSelectedIndexes}`,
        sample
          .filter((props) => props.extraValues?.some((gain) => gain.type === propKey))
          .map((button) => button.index)
      );
    }

    properties.set(MessagingConstants.roundNumber, bonusRound.roundNumber.toString());
    properties.set(
      MessagingConstants.userFriendlyRoundNumber,
      (bonusRound.roundNumber + 1).toString()
    );
    properties.set(MessagingConstants.roundType, bonusRound.roundType);

    return properties;
  }

  resultProperties(bonusContext: BonusContext, bonusResult: IBonusResult): Map<string, any> {
    const properties: Map<string, any> = new Map();

    properties.set(MessagingConstants.bonusWin, NumberFormatter.format(bonusResult.bonusWin));
    properties.set(MessagingConstants.totalWin, NumberFormatter.format(bonusResult.totalWin));
    properties.set(MessagingConstants.additionWin, NumberFormatter.format(bonusResult.additionWin));
    properties.set(MessagingConstants.bet, NumberFormatter.format(bonusResult.bet));
    properties.set(MessagingConstants.lines, NumberFormatter.format(bonusResult.lines));
    properties.set(
      MessagingConstants.totalBet,
      NumberFormatter.format(bonusResult.bet * bonusResult.lines)
    );
    properties.set(
      MessagingConstants.totalBetWithMultiplier,
      NumberFormatter.format(bonusResult.bet * bonusResult.lines * bonusResult.multiplier)
    );
    properties.set(MessagingConstants.multiplier, bonusResult.multiplier);
    properties.set(
      MessagingConstants.formula,
      `${NumberFormatter.format(bonusResult.bonusWin)} x ${NumberFormatter.format(
        bonusResult.bet
      )} = ${NumberFormatter.format(bonusResult.totalWin)}`
    );
    return properties;
  }
}
