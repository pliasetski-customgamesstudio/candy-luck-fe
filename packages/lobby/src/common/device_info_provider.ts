// import {IDeviceInfoProvider} from "@cgs/common";
// import {ILocalizationInfoProvider} from "@cgs/common";
// import {IApplicationInfo} from "@cgs/common";
// import {IWebGlChecker} from "@cgs/common";
//
// export class DeviceInfoProvider implements IDeviceInfoProvider {
//   private _currentTimeZone: string;
//   private _localizationProvider: ILocalizationInfoProvider;
//   private _applicationInfo: IApplicationInfo;
//   private _webGlChecker: IWebGlChecker;
//   private _authHolder: AuthorizationHolder;
//   private _localSessionStorage: ILocalSessionStorage;
//
//   constructor(localizationProvider: ILocalizationInfoProvider, applicationInfo: IApplicationInfo, webGlChecker: IWebGlChecker, authHolder: AuthorizationHolder, localSessionStorage: ILocalSessionStorage) {
//     this._localizationProvider = localizationProvider;
//     this._applicationInfo = applicationInfo;
//     this._webGlChecker = webGlChecker;
//     this._authHolder = authHolder;
//     this._localSessionStorage = localSessionStorage;
//     this._currentTimeZone = timeZoneGmt();
//   }
//
//   public async getDeviceInfo(): Promise<DeviceAuthorizationInfo> {
//     const parsed = parseUserAgent();
//     const screenInfo = screen();
//
//     const sessionInfo = this._localSessionStorage.loadLocal();
//
//     const deviceInfo: DeviceAuthorizationInfo = new DeviceAuthorizationInfo();
//     deviceInfo.browser = parsed.browser;
//     deviceInfo.os = parsed.os;
//     if (this._authHolder.isH5Pay) {
//       deviceInfo.platform = "h5Pay";
//     } else if (this._authHolder.isWebSite) {
//       deviceInfo.platform = "web_sa";
//     } else {
//       deviceInfo.platform = "browser";
//     }
//     deviceInfo.appVersion = this._applicationInfo.appVersion;
//     deviceInfo.resolution = `${screenInfo.w}x${screenInfo.h}`;
//     deviceInfo.locale = this._localizationProvider.currentLocale;
//     deviceInfo.renderTechnology = this._webGlChecker.isWebGl ? "webgl" : "canvas";
//     if (sessionInfo &&
//       sessionInfo.email != AuthorizationTypeConstants.AuthorizationTypeSA &&
//       sessionInfo.email != AuthorizationTypeConstants.AuthorizationTypeFacebook &&
//       sessionInfo.email != AuthorizationTypeConstants.AuthorizationTypeGoogle) {
//       deviceInfo.email = sessionInfo.email;
//       deviceInfo.password = sessionInfo.password;
//     }
//
//     return deviceInfo;
//   }
//
//   public get currentTimeZone(): string {
//     return this._currentTimeZone;
//   }
//
//   public get resPlatform(): string {
//     return "browser";
//   }
// }
