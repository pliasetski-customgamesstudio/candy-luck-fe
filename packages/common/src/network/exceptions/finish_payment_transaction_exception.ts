import { BaseApiException } from './base_api_exception';

export class FinishPaymentTransactionException extends BaseApiException {
  public readonly name: string = 'FinishPaymentTransactionException';
}
