// // class TopPlayersMode extends Enum<string> {
// //   static readonly vipPoints = new TopPlayersMode('vipPoints');
// //   static readonly level = new TopPlayersMode('level');
// //   constructor(value: string) {
// //     super(value);
// //   }
// // }

// import { IExceptionHandlerFacade, SimpleDetailedUserInfoDTO, SimpleUserApiService } from "@cgs/network";
// import { ISessionHolder } from "./authorization/i_session_holder";
// import { IDeviceInfoProvider } from "./interfaces/i_device_info_provider";
// import { ILobbyService } from "./interfaces/i_lobby_service";

// class LobbyService implements ILobbyService {
//   private _exceptionHandlerFacade: IExceptionHandlerFacade;
//   private _sessionHolder: ISessionHolder;
//   private _deviceInfoProvider: IDeviceInfoProvider;
//   private _gameApiService: GameApiService;
//   private _userApiService: SimpleUserApiService;

//   constructor(
//     gameApiService: GameApiService,
//     userApiService: SimpleUserApiService,
//     sessionHolder: ISessionHolder,
//     deviceInfoProvider: IDeviceInfoProvider,
//     exceptionHandlerFacade: IExceptionHandlerFacade
//   ) {
//     this._gameApiService = gameApiService;
//     this._userApiService = userApiService;
//     this._sessionHolder = sessionHolder;
//     this._deviceInfoProvider = deviceInfoProvider;
//     this._exceptionHandlerFacade = exceptionHandlerFacade;
//   }

//   async getUserInfo(): Promise<SimpleDetailedUserInfoDTO> {
//     const request = new BaseRequest();
//     request.session = this._sessionHolder.sessionToken;
//     request.userId = parseFloat((this._sessionHolder as SlotOnlyAuthorizationHolder).userId);
//     return await new FuncEx0(() => this._userApiService.getUserInfo(request)).call();
//   }

//   // surveyAnswer(request: SurveyAnswerRequest): Promise<SurveyQuestionDto> {
//   //   request.session = this._sessionHolder.sessionToken;
//   //   return this._userApiService.surveyAnswer(request);
//   // }

//   // surveyStartRating(): Promise<SurveyQuestionDto> {
//   //   const request = new BaseRequest();
//   //   request.session = this._sessionHolder.sessionToken;
//   //   return this._userApiService.surveyStartRating(request);
//   // }

//   // saveStructuredUserGameConfig(request: UserGameConfigRequest): Promise<void> {
//   //   request.session = this._sessionHolder.sessionToken;
//   //   return this._gameApiService.saveStructuredUserGameConfig(request);
//   // }

//   // getStructuredUserGameConfig(request: UserGameConfigRequest): Promise<UserGameConfigResponse> {
//   //   request.session = this._sessionHolder.sessionToken;
//   //   return this._gameApiService.getStructuredUserGameConfig(request);
//   // }
// }
