import { IBonusRound, BonusContext, MessagingConstants, NumberFormatter } from '@cgs/common';
import { DefaultRoundResolver } from './default_round_resolver';

export class PaytableRoundResolver extends DefaultRoundResolver {
  roundProperties(bonusContext: BonusContext, bonusRound: IBonusRound): Map<string, any> {
    const properties = super.roundProperties(bonusContext, bonusRound);
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

    const selectedViews = bonusRound.selectedButtons || [];
    for (const type of selectedViews.map((v) => v.type)) {
      const group = selectedViews.filter((v) => v.type === type);
      properties.set(
        `${type}.${MessagingConstants.selectedValues}`,
        group.map((v) => NumberFormatter.format(v.value))
      );
      properties.set(
        `${type}.${MessagingConstants.selectedIndexes}`,
        group.map((v) => v.index)
      );
    }

    const notSelectedViews = bonusRound.notSelectedButtons || [];
    for (const type of notSelectedViews.map((v) => v.type)) {
      const group = notSelectedViews.filter((v) => v.type === type);
      properties.set(
        `${type}.${MessagingConstants.notSelectedValues}`,
        group.map((v) => NumberFormatter.format(v.value))
      );
      properties.set(
        `${type}.${MessagingConstants.notSelectedIndexes}`,
        group.map((v) => v.index)
      );
    }

    return properties;
  }
}
