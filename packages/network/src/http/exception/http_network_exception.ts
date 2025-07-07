import { HttpException } from './http_exception';

export class HttpNetworkException extends HttpException {
  public readonly name: string = 'HttpNetworkException';
}
