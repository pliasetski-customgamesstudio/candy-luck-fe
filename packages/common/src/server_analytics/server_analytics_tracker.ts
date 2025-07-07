import { RequestStatistics } from './server_analytics_storage';
import { BaseClientEvent } from '@cgs/shared';
import { ClientEventModel } from '@cgs/shared';

export interface IServerAnalyticsTracker {
  trackStatistics(statistics: Iterable<RequestStatistics>): void;
}

export class BaseRequestTimeEvent extends BaseClientEvent {
  private _url: string;
  private _value: number;
  private _count: number;

  constructor(url: string, value: number, count: number, eventName: string) {
    super('diagnostics', eventName);
    this._url = url;
    this._value = value;
    this._count = count;
  }

  fillEventModel(model: ClientEventModel): void {
    super.fillEventModel(model);
    model.eventInitiator = this._url;
    model.eventValue = this._value.toString();
    model.additionalParams = this._count.toString();
  }
}

export class RequestTimeMaxEvent extends BaseRequestTimeEvent {
  constructor(url: string, value: number, count: number) {
    super(url, value, count, 'requestTimeMax');
  }
}

export class RequestTimeMinEvent extends BaseRequestTimeEvent {
  constructor(url: string, value: number, count: number) {
    super(url, value, count, 'requestTimeMin');
  }
}

export class RequestTimeAvgEvent extends BaseRequestTimeEvent {
  constructor(url: string, value: number, count: number) {
    super(url, value, count, 'requestTimeAvg');
  }
}

export class ServerAnalyticsTracker implements IServerAnalyticsTracker {
  constructor() {}

  trackStatistics(_statistics: Iterable<RequestStatistics>): void {}
}
