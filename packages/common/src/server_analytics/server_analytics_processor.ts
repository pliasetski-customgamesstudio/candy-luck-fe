import { ServiceAddress } from '@cgs/network';

export interface IServerAnalyticsProcessor {
  processRequest(address: ServiceAddress, millisecondsDuration: number): void;
}

export class StubServerAnalyticsProcessor implements IServerAnalyticsProcessor {
  processRequest(_address: ServiceAddress, _millisecondsDuration: number): void {}
}
