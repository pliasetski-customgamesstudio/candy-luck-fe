import { IClientProperties, T_IClientProperties } from '@cgs/common';
import { SceneObject, Container } from '@cgs/syd';
import { SlotSession, SlotSessionProperties } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider } from '../../../../type_definitions';

export class HudStateController {
  private _slotSession: SlotSession;
  private _hudObject: SceneObject;
  private _clientProperties: IClientProperties;

  constructor(container: Container, hudObject: SceneObject) {
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._hudObject = hudObject;
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);

    this._slotSession.propertyChanged.listen((property) => {
      if (property === SlotSessionProperties.BetMultiplier) {
        this.setHudState();
      }
    });
  }

  private setHudState(): void {}

  public hideBetWinTexts(): void {
    this._hudObject.findById('total_win')!.visible = false;
    this._hudObject.findById('totalbet_txt')!.visible = false;
  }

  public showBetWinTexts(): void {
    this._hudObject.findById('total_win')!.visible = true;
    this._hudObject.findById('totalbet_txt')!.visible = true;
  }
}
