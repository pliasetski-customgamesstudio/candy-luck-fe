// import { HttpClient, ExceptionHandlerFacade, RequestSettings, RequestNotifier, RequestSynchronizer, ConnectionMonitor } from 'network';
// import { BaseApiService, ServiceAddress, BaseRequest, RetryingParams, FuncEx2 } from 'shared';
// import { MergedPositionsStateDTO } from 'shared';
//
// class IndicatorPosApiService extends BaseApiService {
//   constructor(
//     private httpClient: HttpClient,
//     private exceptionHandlerFacade: ExceptionHandlerFacade,
//     private requestSettings: RequestSettings,
//     private requestNotifier: RequestNotifier,
//     private requestSynchronizer: RequestSynchronizer,
//     private connectionMonitor: ConnectionMonitor
//   ) {
//     super(httpClient, exceptionHandlerFacade, requestSettings, requestNotifier, requestSynchronizer, connectionMonitor);
//   }
//
//   static get baseUri(): string {
//     return NetworkConfig.indicatorPosServiceUri;
//   }
//
//   static readonly HttpMethod: string = "POST";
//
//   static readonly ServiceName: string = "indicatorPos";
//
//   private readonly _getIndicatorPosConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getIndicatorPosConfig", HttpMethod);
//   getIndicatorPosConfig(request: BaseRequest): Promise<MergedPositionsStateDTO> {
//     const address = this._getIndicatorPosConfig;
//     const responseType = MergedPositionsStateDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<MergedPositionsStateDTO>>((p, a) => this.doRequest<BaseRequest, MergedPositionsStateDTO>(a, request, MergedPositionsStateDTO))
//            .wrap((taskFactory, retrying, addr) => this.exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//            .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap(this.exceptionHandlerFacade.retryWhenServerError)
//            .wrap(this.exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
// }
