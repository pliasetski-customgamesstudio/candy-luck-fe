import { RoundComponentBase } from './round_component_base';
import { SceneObject } from '@cgs/syd';
import { CardsGeneratorConfiguration } from '../configuration/elements/cards_generator_configuration';
import { RandomIterator } from '../utils/random_iterator';
import { RoundMessage } from '../messaging/round_message';
import { RoundMessageType } from '../enums/round_message_type';
import { MessagingConstants } from '../messaging/messaging_constants';

export class CardsGeneratorComponent extends RoundComponentBase {
  private _dealerIterator: Iterator<number>;
  private _cardsIterator: Iterator<number>;
  private _greaterCardsCount: number;
  private _lessCardsCount: number;
  private _dealerCard: number;
  private _usedCardsInCurrentRound: number[];

  constructor(source: SceneObject[], configuration: CardsGeneratorConfiguration) {
    super(source, configuration.name);
    this._greaterCardsCount = 2;
    this._lessCardsCount = 2;
    const dealerElements: number[] = Array.from({ length: 52 }, (_, i) => i + 1);
    const exceptValues = [1, 13, 14, 26, 27, 39, 40, 52];
    this._dealerIterator = new RandomIterator(
      dealerElements.filter((x) => !exceptValues.includes(x))
    );
    const cardsElements: number[] = Array.from({ length: 52 }, (_, i) => i + 1);
    this._cardsIterator = new RandomIterator(cardsElements);
  }

  public proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    if (message.type === RoundMessageType.Win || message.type === RoundMessageType.Lose) {
      this._usedCardsInCurrentRound = [];
      this._usedCardsInCurrentRound.push(this._dealerCard);
      const greaterCardsList: number[] = [];
      for (let i = 0; i < this._greaterCardsCount; i++) {
        greaterCardsList.push(this._getCardGreaterThanValue(this._dealerCard));
      }

      const lessCardsList: number[] = [];
      for (let i = 0; i < this._greaterCardsCount; i++) {
        lessCardsList.push(this._getCardLessThanValue(this._dealerCard));
      }

      if (message.type === RoundMessageType.Win) {
        message.setValue(MessagingConstants.selectedCards, greaterCardsList[0]);
        message.setValue(MessagingConstants.notSelectedCards, [
          ...lessCardsList,
          ...greaterCardsList.slice(1),
        ]);
      } else {
        message.setValue(MessagingConstants.selectedCards, lessCardsList[0]);
        message.setValue(MessagingConstants.notSelectedCards, [
          ...greaterCardsList,
          ...lessCardsList.slice(1),
        ]);
      }
    }
    if (message.type === RoundMessageType.Init || message.type === RoundMessageType.Win) {
      this._dealerCard = this._dealerIterator.next().value;
      message.setValue(MessagingConstants.dealerCards, this._dealerCard);
    }
  }

  private _getCardGreaterThanValue(value: number): number {
    const card = value % 13;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const value = this._cardsIterator.next().value;
      if (value % 13 < card && value % 13 !== 0 && !this._usedCardsInCurrentRound.includes(value)) {
        this._usedCardsInCurrentRound.push(value);
        return value;
      }
    }
  }

  private _getCardLessThanValue(value: number): number {
    const card = value % 13;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const value = this._cardsIterator.next().value;
      if (
        value % 13 > card ||
        (value % 13 === 0 && !this._usedCardsInCurrentRound.includes(value))
      ) {
        this._usedCardsInCurrentRound.push(value);
        return value;
      }
    }
  }
}
