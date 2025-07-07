import { Container } from '@cgs/syd';
import { SlotSession, SlotSessionProperties } from '../common/slot_session';
import { T_ISlotSessionProvider } from '../../type_definitions';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class StickyMaxBetProvider {
  private _slotSession: SlotSession;

  constructor(container: Container) {
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._slotSession.propertyChanged.listen((property: SlotSessionProperties) => {
      if (this.isStickyBetAvailable) {
        if (property === SlotSessionProperties.UpdateMaxBet) {
          if (this._slotSession.isXtremeBetNow) {
            this._slotSession.setMaxFeatureBet();
          } else {
            this.updateMaxBet();
          }
        }
      }
    });
  }

  public get isStickyBetAvailable(): boolean {
    return true;
  }

  public updateMaxBet(): void {
    this._slotSession.setMaxBet();
  }
}
