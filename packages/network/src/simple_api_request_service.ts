import { HttpClient } from './http/http_client';
import { IRequestSynchronizer } from './request_synchronizer';
import { ServiceAddress } from './service_address';
import { Func1, Duration, Logger, StringUtils, LangEx } from '@cgs/shared';
import { ParseException } from './http/exception/parse_exception';
import { RequestBuilder } from './request_builder';
import { HttpRequestMessage } from './http/http_request_message';

export interface IDtoObject {
  toJson(): Record<string, any>;
}

export class SimpleApiRequestService {
  private _httpClient: HttpClient;
  private _requestSynchronizer: IRequestSynchronizer;

  constructor(httpClient: HttpClient, requestSynchronizer: IRequestSynchronizer) {
    this._httpClient = httpClient;
    this._requestSynchronizer = requestSynchronizer;
  }

  async doRequest<T>(
    address: ServiceAddress,
    requestDto: IDtoObject,
    factory: Func1<Record<string, any>, T>,
    timeOut: Duration
  ): Promise<T> {
    return await LangEx.usingAsync(
      await this._requestSynchronizer.startExecutingRequest(address),
      async () => {
        const request = this._buildRequest(address, requestDto);
        Logger.Debug(`${request.method} to ${request.uri}`);
        Logger.Debug(request.body);

        const response = await this._httpClient.sendRequest(request, timeOut);
        Logger.Info(
          `response from ${request.method} ${request.uri} : ${response.statusCode} (${response.status})`
        );
        if (!StringUtils.isNullOrEmpty(response.responseText)) {
          Logger.Debug(response.responseText);
        }
        if (StringUtils.isNullOrEmpty(response.responseText)) {
          return null;
        }
        try {
          return factory(JSON.parse(response.responseText));
        } catch (error) {
          throw new ParseException(error);
        }
      }
    );
  }

  private _buildRequest(address: ServiceAddress, requestDto: IDtoObject): HttpRequestMessage {
    const requestBuilder = new RequestBuilder();
    requestBuilder.addBaseUri(address.baseUri);
    requestBuilder.addRestPath(address.restPath);
    requestBuilder.addHttpMethod(address.httpMethod);
    requestBuilder.addContent(JSON.stringify(requestDto.toJson()));
    return requestBuilder.buildRequest();
  }
}
