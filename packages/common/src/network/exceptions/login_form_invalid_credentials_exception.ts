import { BaseApiException } from './base_api_exception';

export class LoginFormInvalidCredenticalsException extends BaseApiException {
  public readonly name: string = 'LoginFormInvalidCredenticalsException';
}
