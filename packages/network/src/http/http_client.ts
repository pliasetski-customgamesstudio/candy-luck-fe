import { IHttpClient } from './i_http_client';
import { HttpResponseMessage } from './http_response_message';
import { HttpRequestMessage } from './http_request_message';
import { ServerException } from './exception/server_exception';
import { HttpNetworkException } from './exception/http_network_exception';
import { HttpTimeoutException } from './exception/http_timeout_exception';
import { Duration } from '@cgs/shared';

export class HttpClient implements IHttpClient {
  get(requestUri: string, timeOut: Duration): Promise<HttpResponseMessage> {
    return this.sendRequest(new HttpRequestMessage('GET', requestUri), timeOut);
  }

  async getString(requestUri: string, timeOut: Duration): Promise<string> {
    const response = await this.get(requestUri, timeOut);
    return response.responseText;
  }

  sendRequest(request: HttpRequestMessage, timeOut: Duration): Promise<HttpResponseMessage> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(request.method, request.uri, true);

      xhr.timeout = timeOut.inMilliseconds;
      if (!request.method) {
        request.method = 'GET';
      }

      xhr.setRequestHeader('Content-Type', request.contentType);

      if (request.headers) {
        request.headers.forEach((header, value) => {
          xhr.setRequestHeader(header, value);
        });
      }

      xhr.onload = () => {
        const accepted = xhr.status >= 200 && xhr.status < 300;
        const fileUri = xhr.status === 0; // file:// URIs have status of 0.
        const notModified = xhr.status === 304;

        const response = new HttpResponseMessage(xhr.status, xhr.statusText, xhr.responseText);
        if (accepted || fileUri || notModified) {
          resolve(response);
        } else {
          reject(new ServerException(request, response));
        }
      };

      xhr.onerror = () => reject(new HttpNetworkException(request));
      xhr.ontimeout = () => reject(new HttpTimeoutException(request));
      xhr.send(request.body);
    });
  }
}
