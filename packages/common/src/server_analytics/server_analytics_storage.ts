export class RequestStatistics {
  constructor() {
    this.minRequestTime = 99999999999;
  }
  requestsCount: number = 0;
  maxRequestTime: number = 0;
  minRequestTime: number = 0;
  avgRequestTime: number = 0;
  requestUrl: string;
}

export abstract class IServerAnalyticsStorage {
  abstract save(stat: RequestStatistics): void;
  abstract get(url: string): RequestStatistics;
  abstract getAll(): Iterable<RequestStatistics>;
  abstract clear(): void;
}

export class ServerAnalyticsStorage extends IServerAnalyticsStorage {
  private _statisticses: Map<string, RequestStatistics>;

  constructor() {
    super();
    this._statisticses = new Map<string, RequestStatistics>();
  }

  save(stat: RequestStatistics): void {
    this._statisticses.set(stat.requestUrl, stat);
  }

  get(url: string): RequestStatistics {
    let stat: RequestStatistics;
    if (this._statisticses.has(url)) {
      stat = this._statisticses.get(url)!;
      return stat;
    }
    const requestStatistics = new RequestStatistics();
    requestStatistics.requestUrl = url;
    return requestStatistics;
  }

  getAll(): Iterable<RequestStatistics> {
    return this._statisticses.values();
  }

  clear(): void {
    this._statisticses.clear();
  }
}
