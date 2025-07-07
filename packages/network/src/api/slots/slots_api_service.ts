// import { IHttpClient } from 'network';
// import { IExceptionHandlerFacade } from 'shared';
// import { IRequestSettings } from 'network';
// import { IRequestNotifier } from 'network';
// import { IRequestSynchronizer } from 'network';
// import { IConnectionMonitor } from 'network';
//
// class SlotsApiService extends BaseApiService {
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
//     return NetworkConfig.slotsServiceUri;
//   }
//
//   static readonly HttpMethod: string = "POST";
//
//   static readonly ServiceName: string = "slots";
//
//   private _pickBonus: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "bonus", HttpMethod);
//   pickBonus(request: BonusPickRequest): Promise<BonusInfoDTO> {
//     const address = this._pickBonus;
//     const responseType = BonusInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<BonusInfoDTO>>((p, a) => doRequest<BonusPickRequest, BonusInfoDTO>(a, request, BonusInfoDTO))
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _modularSpin: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "modularSpin", HttpMethod);
//   modularSpin(request: SpinRequest): Promise<ModularSpinResultResponse> {
//     const address = this._modularSpin;
//     const responseType = ModularSpinResultResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<ModularSpinResultResponse>>((p, a) => doRequest<SpinRequest, ModularSpinResultResponse>(a, request, ModularSpinResultResponse))
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _tutorialSpin: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "tutorialSpin", HttpMethod);
//   tutorialSpin(request: SpinRequest): Promise<SpinResultResponse> {
//     const address = this._tutorialSpin;
//     const responseType = SpinResultResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SpinResultResponse>>((p, a) => doRequest<SpinRequest, SpinResultResponse>(a, request, SpinResultResponse))
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _extraBetSpin: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "extraBetSpin", HttpMethod);
//   extraBetSpin(request: SpinRequest): Promise<SpinResultResponse> {
//     const address = this._extraBetSpin;
//     const responseType = SpinResultResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SpinResultResponse>>((p, a) => doRequest<SpinRequest, SpinResultResponse>(a, request, SpinResultResponse))
//       .wrap((taskFactory, retrying, addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _startMachine: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "start", HttpMethod);
//   startMachine(request: StartMachineRequest): Promise<MachineInfoDTO> {
//     const address = this._startMachine;
//     const responseType = MachineInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<MachineInfoDTO>>((p, a) => doRequest<StartMachineRequest, MachineInfoDTO>(a, request, MachineInfoDTO))
//       .wrap((taskFactory, retrying, addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _pickScatter: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "scatter", HttpMethod);
//   pickScatter(request: ScatterPickRequest): Promise<BonusInfoDTO> {
//     const address = this._pickScatter;
//     const responseType = BonusInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<BonusInfoDTO>>((p, a) => doRequest<ScatterPickRequest, BonusInfoDTO>(a, request, BonusInfoDTO))
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _getMachineInfo: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getMachineInfo", HttpMethod);
//   getMachineInfo(request: StartMachineRequest): Promise<MachineInfoDTO> {
//     const address = this._getMachineInfo;
//     const responseType = MachineInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<MachineInfoDTO>>((p, a) => doRequest<StartMachineRequest, MachineInfoDTO>(a, request, MachineInfoDTO))
//       .wrap((taskFactory, retrying, addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _getExtendedTypes: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getExtendedTypes", HttpMethod);
//   getAdditionalDataTypes(request: BaseRequest): Promise<AdditionalDataTypesResponse> {
//     const address = this._getExtendedTypes;
//     const responseType = AdditionalDataTypesResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<AdditionalDataTypesResponse>>((p, a) => doRequest<BaseRequest, AdditionalDataTypesResponse>(a, request, AdditionalDataTypesResponse))
//       .wrap((taskFactory, retrying, addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _startGamble: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "startGamble", HttpMethod);
//   startGamble(request: StartMachineRequest): Promise<BonusInfoDTO> {
//     const address = this._startGamble;
//     const responseType = BonusInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<BonusInfoDTO>>((p, a) => doRequest<StartMachineRequest, BonusInfoDTO>(a, request, BonusInfoDTO))
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _spin: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "spin", HttpMethod);
//   spin(request: SpinRequest): Promise<SpinResultResponse> {
//     const address = this._spin;
//     const responseType = SpinResultResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SpinResultResponse>>((p, a) => doRequest<SpinRequest, SpinResultResponse>(a, request, SpinResultResponse))
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _startModularMachine: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "startModularMachine", HttpMethod);
//   startModularMachine(request: StartMachineRequest): Promise<ModularMachineInfoDTO> {
//     const address = this._startModularMachine;
//     const responseType = ModularMachineInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<ModularMachineInfoDTO>>((p, a) => doRequest<StartMachineRequest, ModularMachineInfoDTO>(a, request, ModularMachineInfoDTO))
//       .wrap((taskFactory, retrying, addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
//
//   private _pickStatic: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "pickStatic", HttpMethod);
//   pickStatic(request: TStaticActionParams): Promise<TStaticGamesInfoDTO> {
//     const address = this._pickStatic;
//     const responseType = TStaticGamesInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<TStaticGamesInfoDTO>>((p, a) => doRequest<TStaticActionParams, TStaticGamesInfoDTO>(a, request, TStaticGamesInfoDTO))
//       .wrap((taskFactory, retrying, addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
//       .wrap(exceptionHandlerFacade.retryWhenNoInternet)
//       .wrap(exceptionHandlerFacade.retryWhenServerError)
//       .wrap(exceptionHandlerFacade.logFailedRequest)
//       .apply(retryingParams(address), address)
//       ();
//   }
// }
