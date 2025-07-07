import { EventStream } from '@cgs/syd';

export enum ConnectionState {
  Connected = 'connected',
  Disconnected = 'disconnected',
}

export interface IConnectionMonitor {
  connectionStateChanged: EventStream<ConnectionState>;
  notifyRequestSucceed(): void;
}
