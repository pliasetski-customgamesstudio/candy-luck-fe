// import { IHttpClient } from 'network/network';
// import { IExceptionHandlerFacade } from 'shared/shared';
//
// class GameApiService extends BaseApiService {
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
//     return NetworkConfig.gameServiceUri;
//   }
//
//   static readonly HttpMethod: string = "POST";
//
//   static readonly ServiceName: string = "game";
//
//   private _getGameLobbyConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getGameLobbyConfig", HttpMethod);
//   getGameLobbyConfig(request: GameLobbyConfigRequest): Promise<GameLobbyConfigResponse> {
//     const address = this._getGameLobbyConfig;
//     const responseType = GameLobbyConfigResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<GameLobbyConfigResponse>> ((p, a) => doRequest<GameLobbyConfigRequest, GameLobbyConfigResponse>(a, request, GameLobbyConfigResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getUnstructuredUserGameConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getUnstructuredUserGameConfig", HttpMethod);
//   getUnstructuredUserGameConfig(request: UserGameConfigRequest): Promise<UserGameConfigResponse> {
//     const address = this._getUnstructuredUserGameConfig;
//     const responseType = UserGameConfigResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserGameConfigResponse>> ((p, a) => doRequest<UserGameConfigRequest, UserGameConfigResponse>(a, request, UserGameConfigResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getGameConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getGameConfig", HttpMethod);
//   getGameConfig(request: GameConfigRequest): Promise<GameConfigDTO> {
//     const address = this._getGameConfig;
//     const responseType = GameConfigDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<GameConfigDTO>> ((p, a) => doRequest<GameConfigRequest, GameConfigDTO>(a, request, GameConfigDTO))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getGameLocalizationConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getGameLocalizationConfig", HttpMethod);
//   getGameLocalizationConfig(request: BaseResolutionTimeZoneAwareRequest): Promise<BaseUriConfigResponse> {
//     const address = this._getGameLocalizationConfig;
//     const responseType = BaseUriConfigResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<BaseUriConfigResponse>> ((p, a) => doRequest<BaseResolutionTimeZoneAwareRequest, BaseUriConfigResponse>(a, request, BaseUriConfigResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getStructuredUserGameConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getStructuredUserGameConfig", HttpMethod);
//   getStructuredUserGameConfig(request: UserGameConfigRequest): Promise<UserGameConfigResponse> {
//     const address = this._getStructuredUserGameConfig;
//     const responseType = UserGameConfigResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserGameConfigResponse>> ((p, a) => doRequest<UserGameConfigRequest, UserGameConfigResponse>(a, request, UserGameConfigResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _saveUnstructuredUserGameConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "saveUnstructuredUserGameConfig", HttpMethod);
//   saveUnstructuredUserGameConfig(request: UserGameConfigRequest): Promise<EmptyDto> {
//     const address = this._saveUnstructuredUserGameConfig;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>> ((p, a) => doRequest<UserGameConfigRequest, EmptyDto>(a, request, EmptyDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _saveStructuredUserGameConfig: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "saveStructuredUserGameConfig", HttpMethod);
//   saveStructuredUserGameConfig(request: UserGameConfigRequest): Promise<EmptyDto> {
//     const address = this._saveStructuredUserGameConfig;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>> ((p, a) => doRequest<UserGameConfigRequest, EmptyDto>(a, request, EmptyDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
// }
