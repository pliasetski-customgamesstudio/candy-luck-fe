// import { Func1, Func0 } from '@cgs/shared';
// import { IApplicationInfo } from 'i_application_info';
// import { BrowserHelper } from 'utils/browser_helper';
// import { TimeZoneFormatter } from 'utils/time_zone_formatter';
// import { DeviceAuthorizationResult } from './authorization/device_authorization_result';
// import { IAuthorizationHolder } from './authorization/i_authorization_holder';
// import { IAuthorizationService } from './authorization/i_authorization_service';
// import { ISessionHolder } from './authorization/i_session_holder';
// import { IClientProperties } from './interfaces/i_client_properties';
// import { IDeviceInfoProvider } from './interfaces/i_device_info_provider';
// import { ILocalSessionStorage } from './interfaces/i_user_session';
// import { UserSessionHolder } from './local_user_session_holder';
// import { AuthorizationTypeConstants } from './authorization/authorization_holder';
//
// export class AuthorizationService implements IAuthorizationService {
//   private _deviceInfoProvider: IDeviceInfoProvider;
//   private _authorizationApiService: AuthorizationApiService;
//   private _sessionHolder: ISessionHolder;
//   private _clientProperties: IClientProperties;
//   private _applicationInfo: IApplicationInfo;
//   private _authorizationHolder: IAuthorizationHolder;
//   private _sessionStorage: ILocalSessionStorage;
//   private _semaphore: LocalSemaphore = new LocalSemaphore(1);
//   private static _threadsCounter: number = 0;
//   private _authorizationFunc: Func1<AuthorizeRequest, Promise<DeviceAuthorizationResult>>;
//
//   constructor(
//     deviceInfoProvider: IDeviceInfoProvider,
//     applicationInfo: IApplicationInfo,
//     authorizationApiService: AuthorizationApiService,
//     sessionHolder: ISessionHolder,
//     authorizationHolder: IAuthorizationHolder,
//     startupTimeMetter: StartupTimeMetter,
//     sessionStorage: ILocalSessionStorage
//   ) {
//     this._deviceInfoProvider = deviceInfoProvider;
//     this._applicationInfo = applicationInfo;
//     this._authorizationApiService = authorizationApiService;
//     this._sessionHolder = sessionHolder;
//     this._authorizationHolder = authorizationHolder;
//     this._startupTimeMetter = startupTimeMetter;
//     this._sessionStorage = sessionStorage;
//   }
//
//   get authSemaphore(): LocalSemaphore {
//     return this._semaphore;
//   }
//
//   overrideAuthorizationFunction(
//     authorizationFunc: Func1<AuthorizeRequest, Promise<DeviceAuthorizationResult>>
//   ): Disposable {
//     this._authorizationFunc = authorizationFunc;
//     return {
//       dispose: () => {
//         this._authorizationFunc = null;
//       },
//     };
//   }
//
//   async authorizationFunc(request: AuthorizeRequest): Promise<DeviceAuthorizationResult> {
//     this._startupTimeMetter.startTracking('Authorize');
//     const func: Func0<Promise<AuthorizationInfoDTO>> = () =>
//       this.retryWithSocialErrorHandler(this._authorizationApiService.authorize, request);
//     const result = await this.wrap(func);
//     this._startupTimeMetter.stopTracking('Authorize');
//     return result;
//   }
//
//   async lightWeightAuthorizationFunc(
//     request: AuthorizeRequest
//   ): Promise<DeviceAuthorizationResult> {
//     try {
//       this._startupTimeMetter.startTracking('LightweightAuthorize');
//       const func: Func0<Promise<LightWeightSlotAuthorizationResponse>> = () =>
//         this.retryWithSocialErrorHandler(
//           this._authorizationApiService.lightWeightAuthorize,
//           request
//         );
//       const result = await this.wrap(func);
//       this._startupTimeMetter.stopTracking('LightweightAuthorize');
//       return result;
//     } catch (e) {
//       if (e instanceof AuthorizationKeyNotFoundException) {
//         request.key = null;
//         return await this.lightWeightAuthorizationFunc(request);
//       }
//     }
//   }
//
//   async _authorizeLocalDevice(
//     localInfo: UserSessionHolder,
//     key: string,
//     selectedUser: string,
//     trackInstallation: boolean
//   ): Promise<DeviceAuthorizationResult> {
//     const deviceInfo = await this._deviceInfoProvider.getDeviceInfo();
//     if (this._authorizationHolder.isH5Pay) {
//       deviceInfo.platform = 'h5Pay';
//     } else if (this._authorizationHolder.isWebSite) {
//       deviceInfo.platform = 'web_sa';
//     } else {
//       deviceInfo.platform = 'browser';
//     }
//     if (localInfo?.email && localInfo?.password) {
//       deviceInfo.email = localInfo.email;
//       deviceInfo.password = localInfo.password;
//     }
//
//     let socialInfoFormatted: SocialAuthorizationInfo = null;
//     if (
//       localInfo?.email &&
//       localInfo.email != AuthorizationTypeConstants.AuthorizationTypeSA
//     ) {
//       socialInfoFormatted = new SocialAuthorizationInfo();
//       socialInfoFormatted.socialNetwork = 'email';
//       socialInfoFormatted.socialToken = localInfo.email;
//     }
//
//     const request = new AuthorizeRequest();
//     request.timeZoneId = TimeZoneFormatter.getFormattedTimeZone();
//     request.deviceInfo = deviceInfo;
//     request.socialInfo = socialInfoFormatted;
//     request.track = trackInstallation;
//     request.auxAttributionInfo = this._getAuxInfo();
//     request.selectedUser = selectedUser;
//     request.key = this.getKey(key, false);
//
//     const func = this._authorizationFunc || this.authorizationFunc;
//     const result = await func(request);
//     return result;
//   }
//
//   async _authorizeDevice(
//     socialInfo: UserSessionHolder,
//     key: string,
//     selectedUser: string,
//     isRelogin: boolean = false
//   ): Promise<DeviceAuthorizationResult> {
//     const deviceInfo = await this._deviceInfoProvider.getDeviceInfo();
//
//     let socialInfoFormatted: SocialAuthorizationInfo | null = null;
//     if (
//       socialInfo?.email &&
//       socialInfo.email !== AuthorizationTypeConstants.AuthorizationTypeFacebook &&
//       socialInfo.email !== AuthorizationTypeConstants.AuthorizationTypeGoogle
//     ) {
//       socialInfoFormatted = new SocialAuthorizationInfo();
//       socialInfoFormatted.socialNetwork = AuthorizationTypeConstants.AuthorizationTypeEmail;
//       socialInfoFormatted.socialToken = socialInfo.email;
//     } else {
//       socialInfoFormatted = new SocialAuthorizationInfo();
//       socialInfoFormatted.socialNetwork = socialInfo.socialNetwork;
//       socialInfoFormatted.socialToken = socialInfo.socialToken;
//     }
//
//     const authorizationKey = this._authorizationHolder.getAuthorizationKey();
//
//     const request = new AuthorizeRequest();
//     request.timeZoneId = TimeZoneFormatter.getFormattedTimeZone();
//     request.deviceInfo = deviceInfo;
//     request.socialInfo = socialInfoFormatted;
//     request.auxAttributionInfo = this._getAuxInfo();
//     request.key = this.getKey(key, isRelogin);
//     request.selectedUser = selectedUser;
//
//     const func = this._authorizationFunc || this.authorizationFunc;
//
//     if (func === this.authorizationFunc) {
//       request.advAttributionInfoList = this.getAttributionData();
//     }
//
//     const result = await func(request);
//     return result;
//   }
//
//   getKey(key: string, isRelogin: boolean): string {
//     if (isRelogin) {
//       const authorizationKey = this._authorizationHolder.getAuthorizationKey();
//       return key ? key : authorizationKey?.authorizationKey;
//     } else {
//       return key;
//     }
//   }
//
//   async authorizeLocal(
//     authorizationKey: string,
//     userInfo: UserSessionHolder,
//     trackInstallation: boolean = false
//   ): Promise<DeviceAuthorizationResult> {
//     return this._authorizeLocalDevice(userInfo, authorizationKey, null, trackInstallation);
//   }
//
//   async authorizeLocalByUser(
//     authorizationKey: string,
//     userInfo: UserSessionHolder,
//     selectedUser: string
//   ): Promise<DeviceAuthorizationResult> {
//     return this._authorizeLocalDevice(userInfo, authorizationKey, selectedUser, false);
//   }
//
//   async authorizeSocial(
//     authorizationKey: string,
//     socialInfo: UserSessionHolder,
//     isRelogin: boolean = false
//   ): Promise<DeviceAuthorizationResult> {
//     return this._authorizeDevice(socialInfo, authorizationKey, null, isRelogin);
//   }
//
//   async authorizeSocialByUser(
//     authorizationKey: string,
//     socialInfo: UserSessionHolder,
//     selectedUser: string
//   ): Promise<DeviceAuthorizationResult> {
//     return this._authorizeDevice(socialInfo, authorizationKey, selectedUser);
//   }
//
//   async updateSocialAuthorization(request: UpdateSocialAuthorizationRequest): Promise<EmptyDto> {
//     return this._authorizationApiService.updateSocialAuthorization(request);
//   }
//
//   async getSpecialClientConfigProperties(): Promise<ClientConfigResponse> {
//     const configProperties = await this._authorizationApiService.getSpecialClientConfigProperties(
//       (new BaseRequest().session = this._sessionHolder.sessionToken)
//     );
//     if (configProperties?.properties) {
//       this._clientProperties.updateProperties(configProperties.properties, false);
//     }
//     return configProperties;
//   }
//
//   async authorizeByKeyFull(
//     key: string,
//     socialInfo: UserSessionHolder
//   ): Promise<DeviceAuthorizationResult> {
//     const deviceInfo = await this._deviceInfoProvider.getDeviceInfo();
//
//     let socialInfoFormatted: SocialAuthorizationInfo = null;
//     if (
//       socialInfo?.email &&
//       socialInfo.email !== AuthorizationTypeConstants.AuthorizationTypeFacebook &&
//       socialInfo.email !== AuthorizationTypeConstants.AuthorizationTypeGoogle
//     ) {
//       socialInfoFormatted = new SocialAuthorizationInfo();
//       socialInfoFormatted.socialNetwork = AuthorizationTypeConstants.AuthorizationTypeEmail;
//       socialInfoFormatted.socialToken = socialInfo.email;
//     } else {
//       socialInfoFormatted = new SocialAuthorizationInfo();
//       socialInfoFormatted.socialNetwork = socialInfo.socialNetwork;
//       socialInfoFormatted.socialToken = socialInfo.socialToken;
//     }
//
//     const request = new AuthorizeRequest();
//     request.timeZoneId = TimeZoneFormatter.getFormattedTimeZone();
//     request.deviceInfo = deviceInfo;
//     request.socialInfo = socialInfoFormatted;
//     request.auxAttributionInfo = this._getAuxInfo();
//     request.key = key;
//
//     const func = this._authorizationFunc || this.authorizationFunc;
//
//     if (func === this.authorizationFunc) {
//       request.advAttributionInfoList = this.getAttributionData();
//     }
//
//     const result = await func(request);
//     return result;
//   }
//
//   async authorizeByKey(key: string): Promise<DeviceAuthorizationResult> {
//     const params = BrowserHelper.getInstallSourceParams();
//
//     const request = new AuthorizeByKeyRequest();
//     request.key = key;
//     request.timeZoneId = TimeZoneFormatter.getFormattedTimeZone();
//     request.auxAttributionInfo = this._getAuxInfo();
//     request.appVersion = this._applicationInfo.appVersion;
//
//     const func: Func0<Promise<AuthorizationInfoDTO>> = () =>
//       this._authorizationApiService.authorizeByKey(request);
//     const result = await this.wrap(func);
//     return result;
//   }
//
//   getAttributionData(): AdvertisementProviderTrackableDataInfo[] {
//     return null;
//   }
//
//   async wrap<T>(func: Func0<Promise<T>>): Promise<DeviceAuthorizationResult> {
//     try {
//       AuthorizationService._threadsCounter++;
//
//       if (AuthorizationService._threadsCounter === 1) {
//         await this._semaphore.acquire();
//         BaseApiService.authorizationCounter++;
//         const authorization = await func();
//
//         let result: DeviceAuthorizationResult = null;
//         if (authorization instanceof AuthorizationInfoDTO) {
//           result = new DeviceAuthorizationResult.fromApiResponse(authorization);
//         } else if (authorization instanceof LightWeightSlotAuthorizationResponse) {
//           result = new DeviceAuthorizationResult.fromLightWeightAuthorizationResponse(
//             authorization as LightWeightSlotAuthorizationResponse
//           );
//         }
//         if (result.success) {
//           this._authorizationHolder.setAuthorization(result, this._sessionStorage.loadLocal());
//         }
//         return result;
//       } else {
//         await this._semaphore.acquire();
//       }
//     } finally {
//       this._semaphore.release();
//       AuthorizationService._threadsCounter--;
//     }
//     return this._authorizationHolder.getAutorizationResult();
//   }
// }
