import { HttpRequestMessage } from '../http_request_message';

export abstract class HttpException implements Error {
  public readonly name: string = 'HttpException';
  public message: string;
  private readonly _request: HttpRequestMessage;

  constructor(request: HttpRequestMessage) {
    this._request = request;
    this.message = this.getMessage();
  }

  get request(): HttpRequestMessage {
    return this._request;
  }

  protected getMessage(): string {
    return `Server request failed: ${this._request.uri}`;
  }
}
