import { Container } from '@cgs/syd';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { PaytableView } from '../views/paytable_view';
import { BaseSlotPopupController } from './base_popup_controller';
import { MachineSymbol, NumberFormatter } from '@cgs/common';
import { T_ISlotSessionProvider } from '../../../../type_definitions';
import { SlotSession } from '../../slot_session';

export class PaytableController extends BaseSlotPopupController<PaytableView> {
  private _slotSession: SlotSession;
  private _symbols: MachineSymbol[];

  constructor(container: Container, popupView: PaytableView, stopBackgroundSound: boolean) {
    super(container, popupView, stopBackgroundSound);

    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._symbols = this._slotSession.machineInfo.symbols;
  }

  public onPopupShowing(): void {
    super.onPopupShowing();

    this.updateSymbolValues();
  }

  private updateSymbolValues(): void {
    // this.view.trySetSymbolValue(`price_${3}_${6}`, NumberFormatter.format(555555));
    // return;

    const bet = this._slotSession.currentBet.bet;

    const SYMBOL_IDS = [3, 4, 5, 6, 16, 7, 8, 9, 10, 11, 12, 13, 17];

    this._symbols.forEach((symbol) => {
      if (!SYMBOL_IDS.includes(symbol.id) || !symbol.gains) {
        return;
      }

      symbol.gains.forEach((gain, index) => {
        this.view.trySetSymbolValue(
          `price_${symbol.id}_${index + 1}`,
          NumberFormatter.format(gain * bet)
        );
      });
    });

    const multiplier = bet * this._slotSession.lines;

    [0, 0, 1, 3, 10, 25, 50, 100, 500].forEach((gain, index) => {
      this.view.trySetSymbolValue(
        `price_${14}_${index + 1}`,
        NumberFormatter.format(gain * multiplier)
      );
    });
  }
}
