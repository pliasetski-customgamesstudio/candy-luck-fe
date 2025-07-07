// import { RegistrationApiService } from '@cgs/network';
// import { ILocalSessionStorage, IAuthorizationService, IAuthorizationHolder, StartupTimeMetter } from 'features';
// import { ResetPasswordRequest } from '@cgs/shared';
// import { js } from 'dart:js';
//
// class SlotOnlyIntegrationService implements IStandaloneIntegrationService {
//   private _sessionStorage: ILocalSessionStorage;
//   private _registrationService: RegistrationApiService;
//   private _autorizationService: IAuthorizationService;
//   private _authorizationHolder: IAuthorizationHolder;
//   private _startupTimeMetter: StartupTimeMetter;
//   private _registerOnStart: boolean = false;
//
//   private _isResetPassword: boolean;
//   get isResetPassword(): boolean {
//     return false;
//   }
//
//   constructor(
//     sessionStorage: ILocalSessionStorage,
//     registrationService: RegistrationApiService,
//     autorizationService: IAuthorizationService,
//     authorizationHolder: IAuthorizationHolder,
//     startupTimeMetter: StartupTimeMetter
//   ) {
//     this._sessionStorage = sessionStorage;
//     this._registrationService = registrationService;
//     this._autorizationService = autorizationService;
//     this._authorizationHolder = authorizationHolder;
//     this._startupTimeMetter = startupTimeMetter;
//   }
//
//   async registration(email: string, password: string): Promise<boolean> {
//     return true;
//   }
//
//   async recoverPasswordRequest(email: string): Promise<boolean> {
//     return true;
//   }
//
//   async resetPasswordRequest(password: string, rptoken: string): Promise<string> {
//     const request: ResetPasswordRequest = new ResetPasswordRequest();
//     request.password = password;
//     request.rptoken = rptoken;
//     const resetResult = await this._registrationService.resetPassword(request);
//     return resetResult.email;
//   }
//
//   async removeLoginView(): Promise<void> {
//     return true;
//   }
//
//   async login(forceRegistration: boolean, loginMethodSelected: boolean): Promise<boolean> {
//     const authorizationKey = this._authorizationHolder.getAuthorizationKey();
//     const userSession = this.getUserSession();
//     return true;
//   }
//
//   async refreshAuth(): Promise<boolean> {
//     return true;
//   }
//
//   async reloginWithError(state: AuthState): Promise<boolean> {
//     js.context.callMethod("showErrorWindowWithLogin", [state.index]);
//     return true;
//   }
//
//   async _jsAuthDataCallback(completer: Completer<boolean>, dtoSaved: js.JsObject, fromLoginPage: boolean): Promise<boolean> {
//     return true;
//   }
//
//   async logout(): Promise<void> {
//     return true;
//   }
//
//   async relogin(): Promise<void> {
//     return this.login(false, false);
//   }
//
//   async shareWithDialog(url: string): Promise<boolean> {
//     return false;
//   }
//
//   getUserSession(): IUserSession {
//     return this._sessionStorage.loadLocal();
//   }
//
//   setSaSession(): void {
//     this._sessionStorage.removeLocal();
//     const saUserSession: UserSessionHolder = new UserSessionHolder();
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
