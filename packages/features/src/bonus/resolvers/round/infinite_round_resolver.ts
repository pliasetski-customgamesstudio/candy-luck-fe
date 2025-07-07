import { DefaultRoundResolver } from './default_round_resolver';
import {
  BonusContext,
  IBonusResult,
  IBonusRound,
  NumberFormatter,
  RoundMessage,
  RoundMessageType,
} from '@cgs/common';

export class InfiniteRoundResolver extends DefaultRoundResolver {
  static readonly winKey: string = 'M';
  static readonly loseKey: string = 'F';
  static readonly cubeKey: string = 'cube';
  static readonly nextWinKey: string = 'nextWin';
  static readonly quadrupleNextWinKey: string = 'quadrupleNextWin';
  static readonly maxCube: number = 6;

  message(
    bonusContext: BonusContext,
    bonusRound: IBonusRound,
    bonusResult: IBonusResult
  ): RoundMessage {
    const prop = this.properties(bonusContext, bonusRound, bonusResult);
    if (bonusRound.selectedButtons && bonusRound.selectedButtons.length > 0) {
      const btn = bonusRound.selectedButtons[0];
      if (btn.type == InfiniteRoundResolver.winKey) {
        prop.set(
          InfiniteRoundResolver.cubeKey,
          `c${btn.index == 0 ? this.RandomOdd() : this.RandomEven()}`
        );
        return new RoundMessage(RoundMessageType.Win, prop);
      }
      if (btn.type == InfiniteRoundResolver.loseKey) {
        prop.set(
          InfiniteRoundResolver.cubeKey,
          `c${btn.index === 0 ? this.RandomEven() : this.RandomOdd()}`
        );
        return new RoundMessage(RoundMessageType.Lose, prop);
      }
    }
    return new RoundMessage(RoundMessageType.None, prop);
  }

  resultProperties(bonusContext: BonusContext, bonusResult: IBonusResult): Map<string, any> {
    const props = super.resultProperties(bonusContext, bonusResult);
    props.set(InfiniteRoundResolver.nextWinKey, NumberFormatter.format(bonusResult.bonusWin * 2));
    props.set(
      InfiniteRoundResolver.quadrupleNextWinKey,
      NumberFormatter.format(bonusResult.bonusWin * 4)
    );
    return props;
  }

  private RandomOdd(): number {
    return this._random.nextInt(InfiniteRoundResolver.maxCube / 2) * 2 + 1;
  }

  private RandomEven(): number {
    return this._random.nextInt(InfiniteRoundResolver.maxCube / 2) * 2 + 2;
  }
}
