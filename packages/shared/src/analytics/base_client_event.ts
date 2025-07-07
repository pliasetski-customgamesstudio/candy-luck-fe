import { IClientEvent } from './i_client_event';
import { ClientEventModel } from './client_event_model';

export class BaseClientEvent implements IClientEvent {
  private readonly _eventType: string;
  private readonly _eventName: string;

  constructor(eventType: string, eventName: string) {
    this._eventType = eventType;
    this._eventName = eventName;
  }

  get EventType(): string {
    return this._eventType;
  }

  get EventName(): string {
    return this._eventName;
  }

  fillEventModel(model: ClientEventModel): void {
    model.eventName = this._eventName;
    model.eventType = this._eventType;
    model.eventTs = Math.floor(Date.now() / 1000).toString();
  }
}
