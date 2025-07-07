import { IRequestSettings, RetryingParams } from '@cgs/network';
import { IClientProperties, RequestParam } from '../services/interfaces/i_client_properties';
import { Duration } from '@cgs/shared';

export class RequestSettings implements IRequestSettings {
  private readonly DefaultTimeout: number = 60;
  private readonly DefaultNoIntenetRemaining: number = 3;
  private readonly DefaultServerErrorRemaining: number = 3;

  private _clientProperties: IClientProperties;

  constructor(clientProperties: IClientProperties) {
    this._clientProperties = clientProperties;
  }

  getRequestTimeout(serviceName: string, methodName: string): Duration {
    const timeoutSec = this.getValue(this.DefaultTimeout, [
      RequestParam.Timeout,
      serviceName,
      methodName,
    ]);

    return Duration.fromMilliSeconds(timeoutSec * 1000);
  }

  getRetryingParams(serviceName: string, methodName: string): RetryingParams {
    const noInternet = this.getValue(this.DefaultNoIntenetRemaining, [
      RequestParam.NoInternetRetrying,
      serviceName,
      methodName,
    ]);
    const serverError = this.getValue(this.DefaultServerErrorRemaining, [
      RequestParam.ServerErrorRetrying,
    ]);
    return new RetryingParams(noInternet, serverError);
  }

  private getValue(defaultValue: number, args: string[]): number {
    let keyParts = args;
    while (keyParts.length > 0) {
      const key = keyParts.join('.');
      if (this._clientProperties.keyExists(key)) {
        return parseInt(this._clientProperties.get(key));
      }
      keyParts = keyParts.slice(0, keyParts.length - 1);
    }
    return defaultValue;
  }
}
