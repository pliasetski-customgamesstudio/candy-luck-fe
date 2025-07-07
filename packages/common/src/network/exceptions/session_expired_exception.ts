import { BaseApiException } from './base_api_exception';

export class SessionExpiredException extends BaseApiException {
  public readonly name: string = 'SessionExpiredException';
}
