import { BaseApiException } from './base_api_exception';

export class BuyCreditsError extends BaseApiException {
  public readonly name: string = 'BuyCreditsError';
}
