import { BaseApiException } from './base_api_exception';

export class InvalidSequenceNumberException extends BaseApiException {
  public readonly name: string = 'InvalidSequenceNumberException';
}
