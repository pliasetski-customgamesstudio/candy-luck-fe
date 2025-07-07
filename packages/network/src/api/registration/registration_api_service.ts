// import { IHttpClient } from 'network';
// import { IExceptionHandlerFacade } from 'shared';
// import { IRequestSettings } from 'network';
// import { IRequestNotifier } from 'network';
// import { IRequestSynchronizer } from 'network';
// import { IConnectionMonitor } from 'network';
//
// class RegistrationApiService extends BaseApiService {
//   constructor(
//     httpClient: IHttpClient,
//     private _exceptionHandlerFacade: IExceptionHandlerFacade,
//     requestSettings: IRequestSettings,
//     requestNotifier: IRequestNotifier,
//     requestSynchronizer: IRequestSynchronizer,
//     connectionMonitor: IConnectionMonitor
//   ) {
//     super(httpClient, _exceptionHandlerFacade, requestSettings, requestNotifier, requestSynchronizer, connectionMonitor);
//   }
//
//   static get baseUri(): string {
//     return NetworkConfig.registrationServiceUri;
//   }
//
//   static readonly HttpMethod: string = "POST";
//
//   static readonly ServiceName: string = "registration";
//
//   private _recoverPasswordRequest: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "recoverPasswordRequest", HttpMethod);
//   recoverPasswordRequest(request: RecoverPasswordRequest): Promise<EmptyDto> {
//     const address = this._recoverPasswordRequest;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) => doRequest<RecoverPasswordRequest, EmptyDto>(a, request, EmptyDto))
//       .wrap((taskFactory, retrying, addr) => this._exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(this._exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(this._exceptionHandlerFacade.retryWhenServerError)
//       .wrap(this._exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _register: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "register", HttpMethod);
//   register(request: RegistrationRequest): Promise<EmptyDto> {
//     const address = this._register;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) => doRequest<RegistrationRequest, EmptyDto>(a, request, EmptyDto))
//       .wrap((taskFactory, retrying, addr) => this._exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(this._exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(this._exceptionHandlerFacade.retryWhenServerError)
//       .wrap(this._exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _confirmEmail: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "confirmEmail", HttpMethod);
//   confirmEmail(request: ConfirmEmailRequest): Promise<EmptyDto> {
//     const address = this._confirmEmail;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>>((p, a) => doRequest<ConfirmEmailRequest, EmptyDto>(a, request, EmptyDto))
//       .wrap((taskFactory, retrying, addr) => this._exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(this._exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(this._exceptionHandlerFacade.retryWhenServerError)
//       .wrap(this._exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _resetPassword: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "resetPassword", HttpMethod);
//   resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
//     const address = this._resetPassword;
//     const responseType = ResetPasswordResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<ResetPasswordResponse>>((p, a) => doRequest<ResetPasswordRequest, ResetPasswordResponse>(a, request, ResetPasswordResponse))
//       .wrap((taskFactory, retrying, addr) => this._exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(this._exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(this._exceptionHandlerFacade.retryWhenServerError)
//       .wrap(this._exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
// }
