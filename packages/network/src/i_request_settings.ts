import { RetryingParams } from './retrying_params';
import { Duration } from '@cgs/shared';

export interface IRequestSettings {
  getRetryingParams(serviceName: string, methodName: string): RetryingParams;
  getRequestTimeout(serviceName: string, methodName: string): Duration;
}
