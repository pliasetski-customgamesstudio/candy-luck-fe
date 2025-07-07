// import { EventDispatcher } from 'event-dispatcher';
// import { IAuthorizationHolder, ISessionHolder } from './interfaces';
// import { IClientProperties } from './clientProperties';
// import { ILocalSessionStorage } from './localSessionStorage';
// import { DeviceAuthorizationResult } from './deviceAuthorizationResult';
// import { StoredAuthorization } from './storedAuthorization';

// class NoAuthorizationException implements Error {
//   private _message: string;
//   get message(): string {
//     return this._message;
//   }
//   constructor(message: string) {
//     this._message = message;
//   }
// }

export class AuthorizationTypeConstants {
  static readonly AuthorizationTypeSA = 'SA';
  static readonly AuthorizationTypeEmail = 'email';
  static readonly AuthorizationTypeFacebook = 'facebook';
  static readonly AuthorizationTypeGoogle = 'google';
}

// class AuthorizationHolder implements IAuthorizationHolder, ISessionHolder {
//   private AuthorizationKey = 'authorizationKey';
//   private TypeKey = 'authorizationType';
//   private RememberMe = 'rememberMe';

//   private _clientProperties: IClientProperties;
//   private _sessionStorage: ILocalSessionStorage;
//   private _authorization: DeviceAuthorizationResult;
//   public authorizationChangedDispatcher = new EventDispatcher();
//   private _requestSequenceNumber = 0.0;
//   private _storedProperties: Record<string, string> = {};
//   private _isFirstGameSession = false;

//   constructor(clientProperties: IClientProperties) {
//     this._clientProperties = clientProperties;
//   }

//   get isWebSite(): boolean {
//     return (window as any)['STANDALONE_APP'] === 'true';
//   }

//   get isH5Pay(): boolean {
//     return (window as any)['IS_H5PAY'] === 'true';
//   }

//   private _isStandAlone = true;
//   get isStandAlone(): boolean {
//     return this._isStandAlone;
//   }

//   private _isEmail = false;
//   get isEmail(): boolean {
//     return this._isEmail;
//   }

//   private _isFacebook = false;
//   get isFacebook(): boolean {
//     return this._isFacebook;
//   }

//   private _isGoogle = false;
//   get isGoogle(): boolean {
//     return this._isGoogle;
//   }

//   get isWebSa(): boolean {
//     return (this._authorization?.info?.platformId ?? 'web_sa') === 'web_sa';
//   }

//   get authId(): string {
//     return this._authorization?.info?.authId?.toString();
//   }

//   get authorizationChanged(): EventDispatcher {
//     return this.authorizationChangedDispatcher;
//   }

//   private _lastKey: string | null = null;
//   get lastKey(): string | null {
//     return this._lastKey;
//   }
//   set lastKey(key: string) {
//     this._lastKey = key;
//   }

//   getAuthorizationKey(): StoredAuthorization | null {
//     if (this._authorization) {
//       return new StoredAuthorization(
//         this._authorization.authorizationKey,
//         this._authorization.info.authId?.toString()
//       );
//     }

//     let key = Cookies.get(this.AuthorizationKey);
//     key = !key ? this.lastKey : key;
//     let type = Cookies.get(this.TypeKey);
//     return !key ? null : new StoredAuthorization(key, type);
//   }

//   get isFirstLogin(): boolean {
//     return this._authorization && this._authorization.info.firstAuth;
//   }

//   get isFirstGameSession(): boolean {
//     return this._isFirstGameSession;
//   }

//   removeAuthorizationKey(): void {
//     this._authorization = null;
//     this.authorizationChangedDispatcher.dispatchEvent();
//     Cookies.remove(this.AuthorizationKey);
//     Cookies.remove('rememberMe');
//   }

//   getAutorizationResult(): DeviceAuthorizationResult {
//     return this._authorization;
//   }

//   setAuthorization(
//     authorization: DeviceAuthorizationResult,
//     userSessionHolder: UserSessionHolder
//   ): void {
//     if (authorization && !authorization.success) {
//       throw new Error('Trying to set unsuccessful authorization');
//     }

//     if (
//       userSessionHolder?.email &&
//       userSessionHolder.email != AuthorizationTypeConstants.AuthorizationTypeSA &&
//       userSessionHolder.email != AuthorizationTypeConstants.AuthorizationTypeFacebook &&
//       userSessionHolder.email != AuthorizationTypeConstants.AuthorizationTypeGoogle
//     ) {
//       authorization.authorizationType = AuthorizationTypeConstants.AuthorizationTypeEmail;
//     }

//     const changed =
//       !this._authorization ||
//       !this._authorization.info ||
//       this._authorization.authorizationType != authorization.authorizationType ||
//       this._authorization.info.authId != authorization.info.authId;

//     const userChanged =
//       !this._authorization ||
//       !this._authorization.info ||
//       this._authorization.info.userId != authorization.info.userId;

//     Cookies.set(this.AuthorizationKey, authorization.authorizationKey);
//     Cookies.set(this.TypeKey, authorization.info.authId?.toString());
//     this._clientProperties.updateProperties(authorization.clientConfigProperties);

//     if (changed) {
//       this.authorizationChangedDispatcher.dispatchEvent();
//     }

//     if (
//       this._authorization &&
//       this._authorization.isLightWeight &&
//       !authorization.isLightWeight &&
//       this._authorization.success &&
//       authorization.success &&
//       this._authorization.info.userId == authorization.info.userId &&
//       (this._authorization.info.firstAuth ?? true)
//     ) {
//       authorization.info.firstAuth = true;
//     }

//     this._authorization = authorization;

//     if (userChanged) {
//       this._isFirstGameSession = this.isFirstLogin;
//     }

//     this._isStandAlone =
//       this._authorization &&
//       this._authorization.authorizationType == AuthorizationTypeConstants.AuthorizationTypeSA;
//     this._isEmail =
//       this._authorization &&
//       this._authorization.authorizationType == AuthorizationTypeConstants.AuthorizationTypeEmail;
//     this._isFacebook =
//       this._authorization &&
//       this._authorization.authorizationType == AuthorizationTypeConstants.AuthorizationTypeFacebook;
//     this._isGoogle =
//       this._authorization &&
//       this._authorization.authorizationType == AuthorizationTypeConstants.AuthorizationTypeGoogle;

//     this._storedProperties = {};
//   }

//   resetFirstGameSession(): void {
//     this._isFirstGameSession = this.isFirstLogin;
//   }

//   setRememberMe(isRememberMe: boolean): void {
//     Cookies.set(this.RememberMe, isRememberMe.toString());
//   }

//   get userId(): string | null {
//     return this._authorization?.info?.userId?.toString();
//   }

//   incrementRequestSequenceNumber(): void {
//     this._requestSequenceNumber++;
//   }

//   get requestSequenceNumber(): number {
//     return this._requestSequenceNumber;
//   }

//   get sessionToken(): string | null {
//     return !this._authorization ? null : this._authorization.session;
//   }

//   getClientPropertyString(key: string, def: string | null = null): string | null {
//     if (this._storedProperties.hasOwnProperty(key)) {
//       return this._storedProperties[key];
//     }
//     const clientProperties = this._authorization?.info?.clientProperties;
//     if (!clientProperties) {
//       return def;
//     }
//     for (const prop of clientProperties) {
//       if (prop.key == key) {
//         return prop.value;
//       }
//     }
//     return def;
//   }

//   storeClientProperty(key: string, value: string): void {
//     this._storedProperties[key] = value;
//   }
// }
