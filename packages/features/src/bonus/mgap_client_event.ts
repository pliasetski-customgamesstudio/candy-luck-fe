import { BaseClientEvent, ClientEventModel } from '@cgs/shared';

export class MgapClientEvent extends BaseClientEvent {
  private _value: string;

  constructor(eventName: string, value: string) {
    super('mgap', eventName);
    this._value = value;
  }

  fillEventModel(model: ClientEventModel): void {
    super.fillEventModel(model);
    model.eventValue = this._value;
  }
}
