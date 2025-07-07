import { HttpException } from './http_exception';

export class HttpTimeoutException extends HttpException {
  public readonly name: string = 'HttpTimeoutException';
}
