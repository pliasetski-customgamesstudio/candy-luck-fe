// import { IHttpClient } from 'network';
// import { IExceptionHandlerFacade } from 'shared';
// import { IRequestSettings } from 'network';
// import { IRequestNotifier } from 'network';
// import { IRequestSynchronizer } from 'network';
// import { IConnectionMonitor } from 'network';
//
// class SlotsfeaturesApiService extends BaseApiService {
//   constructor(
//     private httpClient: IHttpClient,
//     private _exceptionHandlerFacade: IExceptionHandlerFacade,
//     private requestSettings: IRequestSettings,
//     private requestNotifier: IRequestNotifier,
//     private requestSynchronizer: IRequestSynchronizer,
//     private connectionMonitor: IConnectionMonitor
//   ) {
//     super(httpClient, _exceptionHandlerFacade, requestSettings, requestNotifier, requestSynchronizer, connectionMonitor);
//   }
//
//   static get baseUri(): string {
//     return NetworkConfig.slotsfeaturesServiceUri;
//   }
//
//   static readonly HttpMethod: string = "POST";
//
//   static readonly ServiceName: string = "slotsfeatures";
//
//   private _getUnplayedFeatures: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getUnplayedFeatures", HttpMethod);
//   getUnplayedFeatures(request: UnfinishedFsBonusFeatureRequest): Promise<UnfinishedFsBonusFeatureResponse> {
//     const address = this._getUnplayedFeatures;
//     const responseType = UnfinishedFsBonusFeatureResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UnfinishedFsBonusFeatureResponse>> ((p, a) => doRequest<UnfinishedFsBonusFeatureRequest, UnfinishedFsBonusFeatureResponse>(a, request, UnfinishedFsBonusFeatureResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _syncData: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "syncData", HttpMethod);
//   syncData(request: SyncDataRequest): Promise<SyncDataResponse> {
//     const address = this._syncData;
//     const responseType = SyncDataResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SyncDataResponse>> ((p, a) => doRequest<SyncDataRequest, SyncDataResponse>(a, request, SyncDataResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _trackEvent: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "trackEvent", HttpMethod);
//   trackEvent(request: TrackEventRequest): Promise<EmptyDto> {
//     const address = this._trackEvent;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>> ((p, a) => doRequest<TrackEventRequest, EmptyDto>(a, request, EmptyDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
// }
