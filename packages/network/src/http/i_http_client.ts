import { HttpRequestMessage } from './http_request_message';
import { HttpResponseMessage } from './http_response_message';
import { Duration } from '@cgs/shared';

export const T_IHttpClient = Symbol('IHttpClient');

export interface IHttpClient {
  getString(requestUri: string, timeOut: Duration): Promise<string>;
  get(requestUri: string, timeOut: Duration): Promise<HttpResponseMessage>;
  sendRequest(request: HttpRequestMessage, timeOut: Duration): Promise<HttpResponseMessage>;
}
