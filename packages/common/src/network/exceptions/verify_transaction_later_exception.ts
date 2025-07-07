import { BaseApiException } from './base_api_exception';

export class VerifyTransactionLaterException extends BaseApiException {
  public readonly name: string = 'VerifyTransactionLaterException';
}
