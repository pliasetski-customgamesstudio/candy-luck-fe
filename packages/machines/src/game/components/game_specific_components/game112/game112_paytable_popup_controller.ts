import { NumberFormatter } from '@cgs/common';
import { SceneObject, Container } from '@cgs/syd';
import { PaytableController } from '../../../common/slot/controllers/paytable_controller';
import { PaytableView } from '../../../common/slot/views/paytable_view';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider } from '../../../../type_definitions';

export class Game112PayTablePopupController extends PaytableController {
  private _scene: SceneObject;

  constructor(container: Container, view: PaytableView, stopBackgroundSound: boolean = false) {
    super(container, view, stopBackgroundSound);
    const slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const symbols = slotSession.machineInfo.symbols;

    for (let j = 0; j < symbols.length; j++) {
      if (symbols[j].gains) {
        let gains = symbols[j].gains;

        if (symbols[j].typeGains && symbols[j].id == 1) {
          gains = symbols[j].typeGains;
        }
        for (let i = 0; i < symbols[j].gains!.length; i++) {
          view.trySetSymbolValue(
            `price_${symbols[j].id}_${i + 1}`,
            NumberFormatter.format(gains![i])
          );
        }
      }
    }
  }
}
