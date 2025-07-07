import { BaseApiException } from './base_api_exception';

export class NotActiveSessionException extends BaseApiException {
  public readonly name: string = 'NotActiveSessionException';
}
