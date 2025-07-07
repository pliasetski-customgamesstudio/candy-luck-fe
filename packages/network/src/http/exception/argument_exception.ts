import { HttpRequestMessage } from '../http_request_message';

export class ArgumentException implements Error {
  public readonly name: string = 'ArgumentException';
  public readonly message: string;
  private readonly _request: HttpRequestMessage;

  constructor(request: HttpRequestMessage) {
    this.message = request.toString();
    this._request = request;
  }

  get request(): HttpRequestMessage {
    return this._request;
  }
}
