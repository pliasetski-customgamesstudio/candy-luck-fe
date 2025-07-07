// import {IStandaloneIntegrationService} from "./interfaces/i_standalone_integration_service";
// import {ILocalSessionStorage} from "./interfaces/i_user_session";
//
// export class StandaloneIntegrationService implements IStandaloneIntegrationService {
//   private _sessionStorage: ILocalSessionStorage;
//   private _registrationService: RegistrationApiService;
//   private _autorizationService: IAuthorizationService;
//   private _authorizationHolder: IAuthorizationHolder;
//   private _startupTimeMetter: StartupTimeMetter;
//   private _clientProperties: IClientProperties;
//   private _registerOnStart: boolean = false;
//
//   private _isResetPassword: boolean;
//   get isResetPassword(): boolean {
//     if (this._isResetPassword === undefined) {
//       const rpToken = js.context.callMethod("getParameterByName", ["rptoken"]);
//       this._isResetPassword = !StringUtils.isNullOrEmpty(rpToken);
//     }
//     return this._isResetPassword;
//   }
//
//   constructor(
//     sessionStorage: ILocalSessionStorage,
//     registrationService: RegistrationApiService,
//     autorizationService: IAuthorizationService,
//     authorizationHolder: IAuthorizationHolder,
//     startupTimeMetter: StartupTimeMetter,
//     clientProperties: IClientProperties
//   ) {
//     this._sessionStorage = sessionStorage;
//     this._registrationService = registrationService;
//     this._autorizationService = autorizationService;
//     this._authorizationHolder = authorizationHolder;
//     this._startupTimeMetter = startupTimeMetter;
//     this._clientProperties = clientProperties;
//   }
//
//   async registration(email: string, password: string): Promise<boolean> {
//     const registrationRequest = new RegistrationRequest();
//     registrationRequest.autoConfirmEmail = true;
//     registrationRequest.password = password;
//     registrationRequest.email = email;
//     const registerResult = await this._registrationService.register(registrationRequest);
//     return true;
//   }
//
//   async recoverPasswordRequest(email: string): Promise<boolean> {
//     const request = new RecoverPasswordRequest();
//     request.email = email;
//     try {
//       const registerResult = await this._registrationService.recoverPasswordRequest(request);
//     } catch (e) {
//       return false;
//     }
//     return true;
//   }
//
//   async resetPasswordRequest(password: string, rptoken: string): Promise<string> {
//     const request = new ResetPasswordRequest();
//     request.password = password;
//     request.rptoken = rptoken;
//     const resetResult = await this._registrationService.resetPassword(request);
//     return resetResult.email;
//   }
//
//   async removeLoginView(): Promise<void> {
//     await js.context.callMethod('removeLoginPage');
//   }
//
//   async login(forceRegistration: boolean, loginMethodSelected: boolean): Promise<boolean> {
//     return Promise.resolve(true);
//   }
//
//   async refreshAuth(): Promise<boolean> {
//     const socialNetwork = this.getUserSession().socialNetwork;
//     if (socialNetwork == "facebook") {
//       this._sessionStorage.removeLocal();
//       const fbSession = await this._getSocialInfo(true, false);
//       if (fbSession) {
//         this._sessionStorage.saveLocal(fbSession);
//         return true;
//       }
//       return false;
//     } else if (socialNetwork == "google") {
//       this._sessionStorage.removeLocal();
//       const googleSession = await this._getGoogleInfo(false, true);
//       if (googleSession) {
//         this._sessionStorage.saveLocal(googleSession);
//       }
//       return false;
//     } else {
//       return true;
//     }
//   }
//
//   async reloginWithError(state: AuthState): Promise<boolean> {
//     return Promise.resolve(true);
//   }
//
//   async _jsAuthDataCallback(completer: Completer<boolean>, dtoSaved: js.JsObject, fromLoginPage: boolean): Promise<boolean> {
//     return Promise.resolve(true);
//   }
//
//   async logout(): Promise<void> {
//     this._sessionStorage.removeLocal();
//     this._authorizationHolder.removeAuthorizationKey();
//     return Promise.resolve(true);
//   }
//
//   async relogin(): Promise<void> {
//     this._sessionStorage.removeLocal();
//     return this.login(false, false);
//   }
//
//   async shareWithDialog(url: string): Promise<boolean> {
//     return Promise.resolve(false);
//   }
//
//   getUserSession(): IUserSession {
//     return this._sessionStorage.loadLocal();
//   }
//
//   setSaSession(): void {
//     this._sessionStorage.removeLocal();
//     const saUserSession = new UserSessionHolder();
//     saUserSession.email = AuthorizationTypeConstants.AuthorizationTypeSA;
//     saUserSession.socialNetwork = AuthorizationTypeConstants.AuthorizationTypeSA;
//     this._sessionStorage.saveLocal(saUserSession);
//   }
//
//   async _getSocialInfo(fromLoginPage: boolean, fromBuyRegistrationPopup: boolean): Promise<UserSessionHolder> {
//     return null;
//   }
//
//   async _getGoogleInfo(relogin: boolean, fromLoginPage: boolean): Promise<UserSessionHolder> {
//     return null;
//   }
// }
