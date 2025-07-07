import { BaseApiException } from './base_api_exception';

export class NeedToRereadException extends BaseApiException {
  public readonly name: string = 'NeedToRereadException';
}
