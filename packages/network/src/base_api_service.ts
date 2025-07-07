// import { ApiRequestService } from './api_request_service';
// import { IExceptionHandlerFacade } from './i_exception_handler_facade';
// import { IRequestSettings } from './i_request_settings';
// import { IRequestNotifier } from './api/i_request_notifier';
// import { IConnectionMonitor } from './i_connection_monitor';
// import { HttpClient } from './http/http_client';
// import { IRequestSynchronizer } from './request_synchronizer';
// import { ServiceAddress } from './service_address';
// import { FuncEx2 } from '../dist/shared/src';
// import { Duration, Func2 } from '@cgs/shared';
// import { RetryingParams } from './retrying_params';
//
// export class BaseApiService {
//   private _requestService: ApiRequestService;
//   private _exceptionHandlerFacade: IExceptionHandlerFacade;
//   private _requestSettings: IRequestSettings;
//   private _requestNotifier: IRequestNotifier;
//   private _connectionMonitor: IConnectionMonitor;
//   static authorizationCounter: number = 0;
//
//   constructor(
//     private httpClient: HttpClient,
//     exceptionHandlerFacade: IExceptionHandlerFacade,
//     requestSettings: IRequestSettings,
//     requestNotifier: IRequestNotifier,
//     requestSynchronizer: IRequestSynchronizer,
//     connectionMonitor: IConnectionMonitor
//   ) {
//     this._requestService = new ApiRequestService(httpClient, requestSynchronizer);
//     this._exceptionHandlerFacade = exceptionHandlerFacade;
//     this._requestSettings = requestSettings;
//     this._requestNotifier = requestNotifier;
//     this._connectionMonitor = connectionMonitor;
//   }
//
//   async doRequest<TRequest, TResponse>(
//     address: ServiceAddress,
//     requestDto: TRequest,
//     responseType: Type
//   ): Promise<TResponse> {
//     const response = await new FuncEx2<TRequest, ServiceAddress, Promise<TResponse>>((p, a) =>
//       this._requestService.doRequest(a, requestDto, responseType, this.timeOut(a))
//     )
//       .wrap(this._exceptionHandlerFacade.logRequestTime)
//       .wrap(this._exceptionHandlerFacade.serverError)
//       .wrap(this._exceptionHandlerFacade.sessionExpired)
//       .wrap(this.singlePlayingHandler)
//       .wrap(this.noInternet)
//       .wrap(this._exceptionHandlerFacade.logNoInternet)
//       .wrap(this._exceptionHandlerFacade.logServerError)
//       .apply(requestDto, address)
//       .call();
//     await this._requestNotifier.onRequest(this, address, requestDto, response);
//     this._connectionMonitor.notifyRequestSucceed();
//     return response;
//   }
//
//   timeOut(address: ServiceAddress): Duration {
//     return this._requestSettings.getRequestTimeout(address.serviceName, address.restPath);
//   }
//
//   noInternet<TRequest, TResponse>(
//     taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
//     request: TRequest,
//     addr: ServiceAddress
//   ): Promise<TResponse> {
//     return this._exceptionHandlerFacade.noInternet<TResponse>(() => taskFactory(request, addr));
//   }
//
//   singlePlayingHandler<TRequest, TResponse>(
//     taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
//     request: TRequest,
//     addr: ServiceAddress
//   ): Promise<TResponse> {
//     return this._exceptionHandlerFacade.handleSinglePlaying<TRequest, TResponse>(
//       (r, a) => taskFactory(r, a),
//       request,
//       addr
//     );
//   }
//
//   retryingParams(address: ServiceAddress): RetryingParams {
//     return this._requestSettings.getRetryingParams(address.serviceName, address.restPath);
//   }
// }
