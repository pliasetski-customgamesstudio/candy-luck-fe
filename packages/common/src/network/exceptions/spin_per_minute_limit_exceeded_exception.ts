import { BaseApiException } from './base_api_exception';

export class SpinPerMinuteLimitExceededException extends BaseApiException {
  public readonly name: string = 'SpinPerMinuteLimitExceededException';
}
