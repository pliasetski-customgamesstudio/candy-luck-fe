import { HttpException } from './http_exception';
import { HttpResponseMessage } from '../http_response_message';
import { HttpRequestMessage } from '../http_request_message';

export class ServerException extends HttpException {
  public readonly name: string = 'ServerException';
  private readonly _response: HttpResponseMessage;
  private _data: any;

  constructor(request: HttpRequestMessage, response: HttpResponseMessage) {
    super(request);
    this._response = response;
    this.message = this.getServerMessage();
  }

  get response(): HttpResponseMessage {
    return this._response;
  }

  private getServerMessage(): string {
    const message = this._messageFromJson;

    return (
      this.getMessage() +
      `. Server responded with error code: ${this._response.status}${
        message ? `. Message: ${message}` : ''
      }`
    );
  }

  get errorCode(): number {
    try {
      const errorJson = JSON.parse(this._response.responseText);
      return errorJson['errors'] || 400;
    } catch {
      return 400;
    }
  }

  public get data(): any {
    return this._data;
  }

  private get _messageFromJson(): string {
    let message = '';
    try {
      const errorJson = JSON.parse(this._response.responseText);
      this._data = errorJson;
      if (errorJson instanceof Object && errorJson['_embedded']) {
        const embeddedErrorDescription = errorJson['_embedded'];
        if (embeddedErrorDescription instanceof Object && embeddedErrorDescription['errors']) {
          const errorDescription = embeddedErrorDescription['errors'];
          if (errorDescription[0] instanceof Object && errorDescription[0]['message']) {
            message = errorDescription[0]['message'].toString();
          }
        }
      }
    } catch {
      //
    }
    return message;
  }
}
