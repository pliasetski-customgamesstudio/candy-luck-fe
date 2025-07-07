import {
  BonusContext,
  IBonusResult,
  IBonusRound,
  MessagingConstants,
  RoundMessage,
  RoundMessageType,
} from '@cgs/common';
import { DefaultRoundResolver } from './default_round_resolver';

export class PickUntilFailRoundResolver extends DefaultRoundResolver {
  static readonly selectedButtonsStateKey: string = 'selectedStates';
  static readonly notSelectedButtonsStateKey: string = 'notSelectedStates';
  static readonly failButtonTypes: string[] = ['FC', 'END', 'F'];

  message(
    bonusContext: BonusContext,
    bonusRound: IBonusRound,
    bonusResult: IBonusResult
  ): RoundMessage {
    const props = this.properties(bonusContext, bonusRound, bonusResult);
    if (bonusRound.selectedButtons && bonusRound.selectedButtons.length > 0) {
      return RoundMessage.fromProperties(
        PickUntilFailRoundResolver.failButtonTypes.includes(bonusRound.selectedButtons[0].type)
          ? RoundMessageType.Lose
          : RoundMessageType.Win,
        props
      );
    }
    return RoundMessage.fromProperties(RoundMessageType.None, props);
  }

  roundProperties(bonusContext: BonusContext, bonusRound: IBonusRound): Map<string, any> {
    const properties = super.roundProperties(bonusContext, bonusRound);
    const winIndexes: number[] = [],
      loseIndexes: number[] = [],
      notSelectedWinIndexes: number[] = [],
      notSelectedLoseIndexes: number[] = [];

    if (bonusRound.notSelectedButtons) {
      for (const button of bonusRound.notSelectedButtons) {
        if (PickUntilFailRoundResolver.failButtonTypes.includes(button.type)) {
          notSelectedLoseIndexes.push(button.index);
          loseIndexes.push(button.index);
        } else {
          notSelectedWinIndexes.push(button.index);
          winIndexes.push(button.index);
        }
      }
    }

    if (bonusRound.selectedButtons) {
      for (const button of bonusRound.selectedButtons) {
        if (PickUntilFailRoundResolver.failButtonTypes.includes(button.type)) {
          loseIndexes.push(button.index);
        } else {
          winIndexes.push(button.index);
        }
      }
    }

    properties.set(MessagingConstants.winIndexes, winIndexes);
    properties.set(MessagingConstants.loseIndexes, loseIndexes);
    properties.set(MessagingConstants.notSelectedWinIndexes, notSelectedWinIndexes);
    properties.set(MessagingConstants.notSelectedLoseIndexes, notSelectedLoseIndexes);

    let states: string[] = [];
    if (bonusRound.selectedButtons) {
      states = bonusRound.selectedButtons
        .filter((button) => button.view != 'Finish')
        .map((selectedButton) => (selectedButton.type == 'F' ? 'lose' : 'win'));
    }
    properties.set(PickUntilFailRoundResolver.selectedButtonsStateKey, states);

    states = [];
    if (bonusRound.notSelectedButtons) {
      states = bonusRound.notSelectedButtons.map((notSelectedButton) =>
        notSelectedButton.type == 'F' ? 'lose' : 'win'
      );
    }
    properties.set(PickUntilFailRoundResolver.notSelectedButtonsStateKey, states);

    return properties;
  }
}
