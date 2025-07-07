import { HttpRequestMessage } from './http/http_request_message';

export class RequestBuilder {
  private _httpMethod: string = '';
  private _baseUri: string = '';
  private _restPath: string = '';
  private _content: string = '';
  private _contentType: string = '';
  private _queryParams: Record<string, any> = {};

  public buildRequest(): HttpRequestMessage {
    const request = new HttpRequestMessage(this.buildUri(), this._httpMethod);
    request.method = this._httpMethod;
    request.body = this._content;
    request.contentType = this._contentType;
    return request;
  }

  private buildUri(): string {
    return `${this._baseUri}${this._restPath}${this.generateQuery(this._queryParams)}`;
  }

  public addHttpMethod(httpMethod: string): void {
    this._httpMethod = httpMethod;
  }

  public addRestPath(path: string): void {
    this._restPath = path;
  }

  public addBaseUri(uri: string): void {
    this._baseUri = uri;
  }

  public addContent(content: string): void {
    this._content = content;
    this._contentType = 'application/json';
  }

  public addQueryParams(queryParams: Record<string, any>): void {
    this._queryParams = queryParams;
  }

  private generateQuery(queryParams: Record<string, any>): string {
    let buffer = '';
    let first = true;

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((listValue) => {
          buffer += first ? '?' : '&';
          if (first) first = false;
          buffer += encodeURIComponent(key.toString());
          buffer += '=';
          buffer += encodeURIComponent(listValue.toString());
        });
      } else {
        buffer += first ? '?' : '&';
        if (first) first = false;
        buffer += encodeURIComponent(key.toString());
        buffer += '=';
        buffer += encodeURIComponent(value.toString());
      }
    });
    return buffer;
  }
}
