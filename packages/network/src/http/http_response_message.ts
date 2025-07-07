export class HttpResponseMessage {
  private readonly _status: number;
  private readonly _statusCode: string;
  private readonly _responseText: string;

  constructor(status: number, statusCode: string, responseText: string) {
    this._status = status;
    this._statusCode = statusCode;
    this._responseText = responseText;
  }

  get status(): number {
    return this._status;
  }

  get statusCode(): string {
    return this._statusCode;
  }

  get responseText(): string {
    return this._responseText;
  }
}
