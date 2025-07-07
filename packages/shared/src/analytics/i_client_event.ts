import { ClientEventModel } from './client_event_model';

export interface IClientEvent {
  fillEventModel(model: ClientEventModel): void;
}
