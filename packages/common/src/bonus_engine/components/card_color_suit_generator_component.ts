import { RoundComponentBase } from './round_component_base';
import { SceneObject } from '@cgs/syd';
import { CardColorSuitGeneratorConfiguration } from '../configuration/elements/card_color_suit_generator_configuration';
import { RoundMessage } from '../messaging/round_message';
import { RoundMessageType } from '../enums/round_message_type';
import { MessagingConstants } from '../messaging/messaging_constants';
import { RandomIterator } from '../utils/random_iterator';

export class CardColorSuitGeneratorComponent extends RoundComponentBase {
  private _dealerIterator: Iterator<number>;
  private readonly _redCards: number[];
  private readonly _blackCards: number[];
  private readonly _heartCards: number[];
  private readonly _diamondCards: number[];
  private readonly _clubCards: number[];
  private readonly _spadeCards: number[];

  constructor(source: SceneObject[], configuration: CardColorSuitGeneratorConfiguration) {
    super(source, configuration.name);

    this._spadeCards = Array.from({ length: 13 }, (_, i) => i + 1);
    this._clubCards = Array.from({ length: 13 }, (_, i) => i + 14);
    this._heartCards = Array.from({ length: 13 }, (_, i) => i + 27);
    this._diamondCards = Array.from({ length: 13 }, (_, i) => i + 40);

    this._redCards = [...this._heartCards, ...this._diamondCards];
    this._blackCards = [...this._spadeCards, ...this._clubCards];
  }

  public proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    if (message.type === RoundMessageType.Win) {
      const selectedIndex = (message.getValue(MessagingConstants.selectedIndexes) as number[])[0];
      switch (selectedIndex) {
        case 0:
          this._dealerIterator = new RandomIterator(this._redCards);
          break;
        case 1:
          this._dealerIterator = new RandomIterator(this._blackCards);
          break;
        case 2:
          this._dealerIterator = new RandomIterator(this._spadeCards);
          break;
        case 3:
          this._dealerIterator = new RandomIterator(this._clubCards);
          break;
        case 4:
          this._dealerIterator = new RandomIterator(this._heartCards);
          break;
        case 5:
          this._dealerIterator = new RandomIterator(this._diamondCards);
          break;
        default:
          this._dealerIterator = new RandomIterator([0]);
          break;
      }

      message.setValue(MessagingConstants.dealerCards, this._dealerIterator.next().value);
    }

    if (message.type === RoundMessageType.Lose) {
      const selectedIndex = (message.getValue(MessagingConstants.selectedIndexes) as number[])[0];
      switch (selectedIndex) {
        case 0:
          this._dealerIterator = new RandomIterator(this._blackCards);
          break;
        case 1:
          this._dealerIterator = new RandomIterator(this._redCards);
          break;
        case 2:
          this._dealerIterator = new RandomIterator([...this._clubCards, ...this._redCards]);
          break;
        case 3:
          this._dealerIterator = new RandomIterator([...this._spadeCards, ...this._redCards]);
          break;
        case 4:
          this._dealerIterator = new RandomIterator([...this._diamondCards, ...this._blackCards]);
          break;
        case 5:
          this._dealerIterator = new RandomIterator([...this._heartCards, ...this._blackCards]);
          break;
        default:
          this._dealerIterator = new RandomIterator([0]);
          break;
      }

      message.setValue(MessagingConstants.dealerCards, this._dealerIterator.next().value);
    }
  }
}
