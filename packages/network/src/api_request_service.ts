// import { Duration, LangEx, Logger, StringUtils } from '@cgs/shared';
// import { HttpClient } from './http/http_client';
// import { IRequestSynchronizer } from './request_synchronizer';
// import { ServiceAddress } from './service_address';
// import { ParseException } from './http/exception/parse_exception';
// import { RequestBuilder } from './request_builder';
//
// export class ApiRequestService {
//   private readonly _httpClient: HttpClient;
//   private readonly _requestSynchronizer: IRequestSynchronizer;
//
//   constructor(httpClient: HttpClient, requestSynchronizer: IRequestSynchronizer) {
//     this._httpClient = httpClient;
//     this._requestSynchronizer = requestSynchronizer;
//   }
//
//   async doRequest<TRequest, TResponse>(
//     address: ServiceAddress,
//     requestDto: TRequest,
//     responseType: any,
//     timeOut: Duration
//   ): Promise<TResponse> {
//     return await LangEx.usingAsync(
//       await this._requestSynchronizer.startExecutingRequest(address),
//       async () => {
//         const request = this._buildRequest(address, requestDto);
//         Logger.Debug(`${request.method} to ${request.uri}`);
//         Logger.Debug(request.body);
//         const response = await this._httpClient.sendRequest(request, timeOut);
//         Logger.Info(
//           `response from ${request.method} ${request.uri} : ${response.statusCode} (${response.status})`
//         );
//         if (!StringUtils.isNullOrEmpty(response.responseText)) {
//           Logger.Debug(response.responseText);
//         }
//         if (StringUtils.isNullOrEmpty(response.responseText)) {
//           return null;
//         }
//         try {
//           return ModelReflection.fromJson(responseType, response.responseText);
//         } catch (ex) {
//           throw new ParseException(ex);
//         }
//       }
//     );
//   }
//
//   private _buildRequest(address: ServiceAddress, requestDto: any): HttpRequest {
//     const requestBuilder = new RequestBuilder();
//     requestBuilder.addBaseUri(address.baseUri);
//     requestBuilder.addRestPath(address.restPath);
//     requestBuilder.addHttpMethod(address.httpMethod);
//     requestBuilder.addContent(ModelReflection.toJson(requestDto));
//     return requestBuilder.buildRequest();
//   }
// }
