import { BonusContext, IBonusRound, MessagingConstants, NumberFormatter } from '@cgs/common';
import { DefaultRoundResolver } from './default_round_resolver';

export class CollectSymbolsRoundWithPaytableResolver extends DefaultRoundResolver {
  roundProperties(bonusContext: BonusContext, bonusRound: IBonusRound): Map<string, any> {
    const properties = super.roundProperties(bonusContext, bonusRound);

    if (bonusRound.paytable) {
      for (const type of bonusRound.paytable.map((r) => r.type)) {
        const group = bonusRound.paytable.filter((p) => p.type === type);
        properties.set(
          `${type}.${MessagingConstants.PaytableTypeKey}`,
          group.map((p) => p.type)
        );
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
        MessagingConstants.PaytableTypeKey,
        bonusRound.paytable.map((p) => p.type)
      );
      properties.set(
        MessagingConstants.paytableIndexesKey,
        bonusRound.paytable.map((p) => bonusRound.paytable!.indexOf(p))
      );
      properties.set(
        MessagingConstants.paytableValuesKey,
        bonusRound.paytable.map((p) => NumberFormatter.format(p.value))
      );
      properties.set(
        MessagingConstants.paytableTotalValuesKey,
        bonusRound.paytable.map((p) => NumberFormatter.format(p.totalValue))
      );
    }

    const selectedViews = bonusRound.selectedButtons
      ? bonusRound.selectedButtons.map((button) => button.view)
      : [];
    properties.set(MessagingConstants.selectedPaytableKey, selectedViews);

    const notSelectedViews = bonusRound.notSelectedButtons
      ? bonusRound.notSelectedButtons.map((button) => button.view)
      : [];
    properties.set(MessagingConstants.notSelectedPaytableKey, notSelectedViews);

    if (bonusRound.paytable) {
      properties.set(
        MessagingConstants.selectedPaytableIndexesKey,
        selectedViews.map((b) =>
          bonusRound.paytable!.indexOf(
            bonusRound.paytable!.find((paytableItem) => paytableItem.type === b)!
          )
        )
      );
      properties.set(
        MessagingConstants.notSelectedPaytableIndexesKey,
        notSelectedViews.map((b) =>
          bonusRound.paytable!.indexOf(
            bonusRound.paytable!.find((paytableItem) => paytableItem.type === b)!
          )
        )
      );
    }

    return properties;
  }
}
