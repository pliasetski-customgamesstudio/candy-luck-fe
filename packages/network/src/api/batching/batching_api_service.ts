// import { HttpClient } from 'network';
// import { ExceptionHandlerFacade, RequestSettings, RequestNotifier, RequestSynchronizer, ConnectionMonitor } from 'shared';
//
// class BatchingApiService extends BaseApiService {
//   private static baseUri: string = NetworkConfig.batchingServiceUri;
//   private static HttpMethod: string = "POST";
//   private static ServiceName: string = "batching";
//
//   private _getBatchInfo: ServiceAddress = new ServiceAddress(BatchingApiService.baseUri, BatchingApiService.ServiceName, "getBatchInfo", BatchingApiService.HttpMethod);
//
//   constructor(private httpClient: HttpClient,
//               private _exceptionHandlerFacade: ExceptionHandlerFacade,
//               private requestSettings: RequestSettings,
//               private requestNotifier: RequestNotifier,
//               private requestSynchronizer: RequestSynchronizer,
//               private connectionMonitor: ConnectionMonitor) {
//     super(httpClient, _exceptionHandlerFacade, requestSettings, requestNotifier, requestSynchronizer, connectionMonitor);
//   }
//
//   public getBatchInfo(request: BatchRequest): Promise<BatchResponse> {
//     const address = this._getBatchInfo;
//     const responseType = BatchResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<BatchResponse>>((p, a) => this.doRequest<BatchRequest, BatchResponse>(a, request, BatchResponse))
//            .wrap((taskFactory, retrying, addr) => this._exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//            .wrap(this._exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap(this._exceptionHandlerFacade.retryWhenServerError)
//            .wrap(this._exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
// }
