import { BaseApiException } from './base_api_exception';

export class BonusUnavailableException extends BaseApiException {
  public readonly name: string = 'BonusUnavailableException';
}
