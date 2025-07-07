// import { IHttpClient } from 'network/network';
// import { IExceptionHandlerFacade } from 'shared/shared';
//
// class UserApiService extends BaseApiService {
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
//     return NetworkConfig.userServiceUri;
//   }
//
//   static readonly HttpMethod: string = "POST";
//
//   static readonly ServiceName: string = "user";
//
//   private _getTopPlayers: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getTopPlayers", HttpMethod);
//   getTopPlayers(request: TopPlayersRequest): Promise<UserDTOCollection> {
//     const address = this._getTopPlayers;
//     const responseType = UserDTOCollection;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserDTOCollection>> ((p, a) => doRequest<TopPlayersRequest, UserDTOCollection>(a, request, UserDTOCollection))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getUserInfo: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "userInfo", HttpMethod);
//   getUserInfo(request: BaseRequest): Promise<DetailedUserInfoDTO> {
//     const address = this._getUserInfo;
//     const responseType = DetailedUserInfoDTO;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<DetailedUserInfoDTO>> ((p, a) => doRequest<BaseRequest, DetailedUserInfoDTO>(a, request, DetailedUserInfoDTO))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getLocalUserMedia: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getLocalUserMedia", HttpMethod);
//   getLocalUserMedia(request: BaseRequest): Promise<UserLocalMediaResponse> {
//     const address = this._getLocalUserMedia;
//     const responseType = UserLocalMediaResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserLocalMediaResponse>> ((p, a) => doRequest<BaseRequest, UserLocalMediaResponse>(a, request, UserLocalMediaResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _setUserStatus: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "setUserStatus", HttpMethod);
//   setUserStatus(request: UserStatusRequest): Promise<UserLocalProfileResponse> {
//     const address = this._setUserStatus;
//     const responseType = UserLocalProfileResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserLocalProfileResponse>> ((p, a) => doRequest<UserStatusRequest, UserLocalProfileResponse>(a, request, UserLocalProfileResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _surveyAnswer: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "surveyAnswer", HttpMethod);
//   surveyAnswer(request: SurveyAnswerRequest): Promise<SurveyQuestionDto> {
//     const address = this._surveyAnswer;
//     const responseType = SurveyQuestionDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SurveyQuestionDto>> ((p, a) => doRequest<SurveyAnswerRequest, SurveyQuestionDto>(a, request, SurveyQuestionDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getFriends: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getFriends", HttpMethod);
//   getFriends(request: BaseRequest): Promise<UserDTOCollection> {
//     const address = this._getFriends;
//     const responseType = UserDTOCollection;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserDTOCollection>> ((p, a) => doRequest<BaseRequest, UserDTOCollection>(a, request, UserDTOCollection))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getCountries: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getCountries", HttpMethod);
//   getCountries(request: BaseRequest): Promise<CountryResponse> {
//     const address = this._getCountries;
//     const responseType = CountryResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<CountryResponse>> ((p, a) => doRequest<BaseRequest, CountryResponse>(a, request, CountryResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _surveyStartRating: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "surveyStartRating", HttpMethod);
//   surveyStartRating(request: BaseRequest): Promise<SurveyQuestionDto> {
//     const address = this._surveyStartRating;
//     const responseType = SurveyQuestionDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SurveyQuestionDto>> ((p, a) => doRequest<BaseRequest, SurveyQuestionDto>(a, request, SurveyQuestionDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getLocalUserStatuses: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getLocalUserStatuses", HttpMethod);
//   getLocalUserStatuses(request: BaseRequest): Promise<UserLocalStatusResponse> {
//     const address = this._getLocalUserStatuses;
//     const responseType = UserLocalStatusResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserLocalStatusResponse>> ((p, a) => doRequest<BaseRequest, UserLocalStatusResponse>(a, request, UserLocalStatusResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _trackInvitedUsers: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "trackInvitedUsers", HttpMethod);
//   trackInvitedUsers(request: InvitedUsersRequest): Promise<EmptyDto> {
//     const address = this._trackInvitedUsers;
//     const responseType = EmptyDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<EmptyDto>> ((p, a) => doRequest<InvitedUsersRequest, EmptyDto>(a, request, EmptyDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getLocalUserProfile: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getLocalUserProfile", HttpMethod);
//   getLocalUserProfile(request: BaseRequest): Promise<UserLocalProfileResponse> {
//     const address = this._getLocalUserProfile;
//     const responseType = UserLocalProfileResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserLocalProfileResponse>> ((p, a) => doRequest<BaseRequest, UserLocalProfileResponse>(a, request, UserLocalProfileResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _surveyStart: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "surveyStart", HttpMethod);
//   surveyStart(request: SurveyRequest): Promise<SurveyQuestionDto> {
//     const address = this._surveyStart;
//     const responseType = SurveyQuestionDto;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<SurveyQuestionDto>> ((p, a) => doRequest<SurveyRequest, SurveyQuestionDto>(a, request, SurveyQuestionDto))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _getFriendsSocialInfo: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "getFriendsSocialInfo", HttpMethod);
//   getFriendsSocialInfo(request: BaseRequest): Promise<UserDTOCollection> {
//     const address = this._getFriendsSocialInfo;
//     const responseType = UserDTOCollection;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserDTOCollection>> ((p, a) => doRequest<BaseRequest, UserDTOCollection>(a, request, UserDTOCollection))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
//
//   private _setLocalUserProfile: ServiceAddress = new ServiceAddress(baseUri, ServiceName, "setLocalUserProfile", HttpMethod);
//   setLocalUserProfile(request: UserLocalProfileRequest): Promise<UserLocalProfileResponse> {
//     const address = this._setLocalUserProfile;
//     const responseType = UserLocalProfileResponse;
//     return new FuncEx2<RetryingParams, ServiceAddress, Promise<UserLocalProfileResponse>> ((p, a) => doRequest<UserLocalProfileRequest, UserLocalProfileResponse>(a, request, UserLocalProfileResponse))
//            .wrap ((taskFactory,retrying,addr) => exceptionHandlerFacade.tryGetBatchedResponse(taskFactory,retrying,addr,responseType))
//            .wrap (exceptionHandlerFacade.retryWhenNoInternet)
//            .wrap (exceptionHandlerFacade.retryWhenServerError)
//            .wrap (exceptionHandlerFacade.logFailedRequest)
//            .apply(retryingParams(address), address)
//            ();
//   }
// }
