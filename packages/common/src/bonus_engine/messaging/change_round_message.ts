import { BonusScreenMessage } from './bonus_message';
import { ChangeRoundType } from '../enums/change_round_type';

export class ChangeRoundMessage extends BonusScreenMessage {
  type: ChangeRoundType;
  roundIndex: number;
  isServerIndex: boolean;
  currentRoundProperties: Map<string, any>;
  nextRoundProperties: Map<string, any>;

  constructor(type: ChangeRoundType, roundIndex: number = -1, isServerIndex: boolean = false) {
    super();
    this.type = type;
    this.roundIndex = roundIndex;
    this.isServerIndex = isServerIndex;
  }
}
