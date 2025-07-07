import { BonusContext, IBonusRound, MessagingConstants } from '@cgs/common';
import { PickUntilFailRoundResolver } from './pick_until_fail_round_resolver';

export class FreeSpinsWrapperResolver extends PickUntilFailRoundResolver {
  roundProperties(bonusContext: BonusContext, bonusRound: IBonusRound): Map<string, any> {
    const props = super.roundProperties(bonusContext, bonusRound);
    let fsCount = 0;
    if (bonusRound.selectedButtons) {
      const fsButton = bonusRound.selectedButtons.find((button) => button.type === 'FSI');
      if (fsButton) {
        fsCount = fsButton.value;
      }
    }
    props.set(MessagingConstants.freeSpinsCount, fsCount);
    props.set(MessagingConstants.wonFreeSpins, fsCount > 0 ? 'True' : 'False');
    return props;
  }
}
