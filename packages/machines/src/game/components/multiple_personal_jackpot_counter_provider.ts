import { Container } from '@cgs/syd';
import { PersonalJackpotCounterProvider } from './personal_jackpot_counter_provider';
import { BonusFinishedArgs, NumberFormatter } from '@cgs/common';

export class MultiplePersonalJackpotCounterProvider extends PersonalJackpotCounterProvider {
  private _wonIndexTemplate: number;

  constructor(
    container: Container,
    jackpotValueSceneObjectIdFormat: string,
    jackpotAnimSceneObjectIdFormat: string,
    bonusSelectedViewRegex: string,
    textIncrementDuration: number,
    wonIndexTemplate: number
  ) {
    super(
      container,
      jackpotValueSceneObjectIdFormat,
      jackpotAnimSceneObjectIdFormat,
      bonusSelectedViewRegex,
      textIncrementDuration
    );
    this._wonIndexTemplate = wonIndexTemplate;
  }

  setInitialJackpot(bonusFinishedArgs: BonusFinishedArgs): void {
    if (bonusFinishedArgs) {
      const jackpotIndexes = this._getJackpotIndexes(bonusFinishedArgs);
      const jackpotInitialValues = this.getInitialResponseJackpotValues();
      for (const jackpotIndex of jackpotIndexes) {
        if (
          jackpotIndex >= 0 &&
          this.jackpotValueSceneObjects.has(jackpotIndex) &&
          jackpotInitialValues &&
          jackpotInitialValues.length > jackpotIndex
        ) {
          const value = parseFloat(jackpotInitialValues[jackpotIndex].toString());
          this.setJackpotValue(jackpotIndex, value);
          this.currentJackpotValues.set(jackpotIndex, value);
        }
      }
    }
  }

  private _getJackpotIndexes(bonusFinishedArgs: BonusFinishedArgs): number[] {
    const regExp = new RegExp(this.bonusSelectedViewRegex);
    return bonusFinishedArgs
      .response!.currentRound!.paytable!.filter(
        (item) => item.index === this._wonIndexTemplate && regExp.test(item.type)
      )
      .map((item) => {
        const regExp = new RegExp('\\d+');
        const match = item.type.match(regExp);
        return match ? parseInt(match[0], 10) : -1;
      });
  }

  setJackpotValue(jackpotIndex: number, jackpotValue: number): void {
    const jackpotTextSceneObject = this.getJackpotTextSceneObject(jackpotIndex);
    if (jackpotTextSceneObject) {
      jackpotTextSceneObject.text = NumberFormatter.formatJackpotLong(jackpotValue, true);
    }
  }
}
