// import { IRequestSettings } from '../../i_request_settings';
// import { IRequestNotifier } from '../i_request_notifier';
// import { IRequestSynchronizer } from '../../request_synchronizer';
// import { IConnectionMonitor } from '../../i_connection_monitor';
// import { ServiceAddress } from '../../service_address';
// import { FuncEx2 } from '../../../dist/shared/src';
// import { RetryingParams } from '../../retrying_params';
// import { IHttpClient } from '../../http/i_http_client';
// import { IExceptionHandlerFacade } from '../../i_exception_handler_facade';
//
// class AuthorizationApiService extends BaseApiService {
//   constructor(
//     private httpClient: IHttpClient,
//     private _exceptionHandlerFacade: IExceptionHandlerFacade,
//     private requestSettings: IRequestSettings,
//     private requestNotifier: IRequestNotifier,
//     private requestSynchronizer: IRequestSynchronizer,
//     private connectionMonitor: IConnectionMonitor
//   ) {
//     super(
//       httpClient,
//       _exceptionHandlerFacade,
//       requestSettings,
//       requestNotifier,
//       requestSynchronizer,
//       connectionMonitor
//     );
//   }
//
//   static get baseUri(): string {
//     return NetworkConfig.authorizationServiceUri;
//   }
//
//   static readonly HttpMethod: string = 'POST';
//
//   static readonly ServiceName: string = 'authorization';
//
//   private _authorize: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'authorize',
//     HttpMethod
//   );
//   authorize(request: AuthorizeRequest): Promise<AuthorizationInfoDTO> {
//     const address = this._authorize;
//     const responseType = AuthorizationInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<AuthorizationInfoDTO>>((p, a) =>
//       doRequest<AuthorizeRequest, AuthorizationInfoDTO>(a, request, AuthorizationInfoDTO)
//     ).apply(retryingParams(address), address)();
//   }
//
//   private _authorizeByKey: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'authorizeByKey',
//     HttpMethod
//   );
//   authorizeByKey(request: AuthorizeByKeyRequest): Promise<AuthorizationInfoDTO> {
//     const address = this._authorizeByKey;
//     const responseType = AuthorizationInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<AuthorizationInfoDTO>>((p, a) =>
//       doRequest<AuthorizeByKeyRequest, AuthorizationInfoDTO>(a, request, AuthorizationInfoDTO)
//     ).apply(retryingParams(address), address)();
//   }
//
//   private _logoutFromFB: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'logoutFromFB',
//     HttpMethod
//   );
//   logoutFromFB(request: BaseRequest): Promise<EmptyDto> {
//     const address = this._logoutFromFB;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<BaseRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _trackInstallSource: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'trackInstallSource',
//     HttpMethod
//   );
//   trackInstallSource(request: TrackInstallationRequest): Promise<EmptyDto> {
//     const address = this._trackInstallSource;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<TrackInstallationRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _slotAuthorize: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'slotAuthorize',
//     HttpMethod
//   );
//   slotAuthorize(request: SlotAuthorizeRequest): Promise<SlotAuthorizationResponse> {
//     const address = this._slotAuthorize;
//     const responseType = SlotAuthorizationResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SlotAuthorizationResponse>>((p, a) =>
//       doRequest<SlotAuthorizeRequest, SlotAuthorizationResponse>(
//         a,
//         request,
//         SlotAuthorizationResponse
//       )
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _getSpecialClientConfigProperties: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'getSpecialClientConfigProperties',
//     HttpMethod
//   );
//   getSpecialClientConfigProperties(request: BaseRequest): Promise<ClientConfigResponse> {
//     const address = this._getSpecialClientConfigProperties;
//     const responseType = ClientConfigResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<ClientConfigResponse>>((p, a) =>
//       doRequest<BaseRequest, ClientConfigResponse>(a, request, ClientConfigResponse)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _changePolicyContentState: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'changePolicyContentState',
//     HttpMethod
//   );
//   changePolicyContentState(request: ChangePolicyContentStateRequest): Promise<EmptyDto> {
//     const address = this._changePolicyContentState;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<ChangePolicyContentStateRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _sawPolicyContentState: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'sawPolicyContentState',
//     HttpMethod
//   );
//   sawPolicyContentState(request: SawPolicyContentRequest): Promise<EmptyDto> {
//     const address = this._sawPolicyContentState;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<SawPolicyContentRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _trackAuxAttribution: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'trackAuxAttribution',
//     HttpMethod
//   );
//   trackAuxAttribution(request: TrackAuxAttributionRequest): Promise<EmptyDto> {
//     const address = this._trackAuxAttribution;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<TrackAuxAttributionRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _warmUpConnection: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'warmUpConnection',
//     HttpMethod
//   );
//   warmUpConnection(request: BaseRequest): Promise<EmptyDto> {
//     const address = this._warmUpConnection;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<BaseRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _updateSocialAuthorization: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'updateSocialAuthorization',
//     HttpMethod
//   );
//   updateSocialAuthorization(request: UpdateSocialAuthorizationRequest): Promise<EmptyDto> {
//     const address = this._updateSocialAuthorization;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<UpdateSocialAuthorizationRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _getClientProperties: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'getClientProperties',
//     HttpMethod
//   );
//   getClientProperties(request: BaseRequest): Promise<ClientPropertiesResponse> {
//     const address = this._getClientProperties;
//     const responseType = ClientPropertiesResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<ClientPropertiesResponse>>((p, a) =>
//       doRequest<BaseRequest, ClientPropertiesResponse>(a, request, ClientPropertiesResponse)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _lightWeightAuthorize: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'lightWeightAuthorize',
//     HttpMethod
//   );
//   lightWeightAuthorize(request: AuthorizeRequest): Promise<LightWeightSlotAuthorizationResponse> {
//     const address = this._lightWeightAuthorize;
//     const responseType = LightWeightSlotAuthorizationResponse;
//     return new FuncEx2<
//       RetryingParams,
//       ServiceAddress,
//       Promise<LightWeightSlotAuthorizationResponse>
//     >((p, a) =>
//       doRequest<AuthorizeRequest, LightWeightSlotAuthorizationResponse>(
//         a,
//         request,
//         LightWeightSlotAuthorizationResponse
//       )
//     ).apply(retryingParams(address), address)();
//   }
//
//   private _getPolicyContentState: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'getPolicyContentState',
//     HttpMethod
//   );
//   getPolicyContentState(
//     request: GetPolicyContentStateRequest
//   ): Promise<GetPolicyContentStateResponse> {
//     const address = this._getPolicyContentState;
//     const responseType = GetPolicyContentStateResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<GetPolicyContentStateResponse>>(
//       (p, a) =>
//         doRequest<GetPolicyContentStateRequest, GetPolicyContentStateResponse>(
//           a,
//           request,
//           GetPolicyContentStateResponse
//         )
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
//
//   private _saveClientProperties: ServiceAddress = new ServiceAddress(
//     baseUri,
//     ServiceName,
//     'saveClientProperties',
//     HttpMethod
//   );
//   saveClientProperties(request: SaveClientPropertiesRequest): Promise<EmptyDto> {
//     const address = this._saveClientProperties;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) =>
//       doRequest<SaveClientPropertiesRequest, EmptyDto>(a, request, EmptyDto)
//     )
//       .wrap((taskFactory, retrying, addr) =>
//         exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType)
//       )
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)();
//   }
// }
