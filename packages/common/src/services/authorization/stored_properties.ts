// import { ISessionHolder } from './i_session_holder';
// import { IAuthorizationHolder } from './i_authorization_holder';
//
// export enum BelongsTo {
//   user = 'user',
//   auth = 'userAuth',
// }
//
// export interface IStoredProperties {
//   saveProperty(key: string, value: string, belongsTo: BelongsTo): Promise<void>;
//   refreshProperties(): Promise<void>;
//   getClientProperty(key: string, def?: string | null): string | null;
//   getClientPropertyBool(key: string, def?: boolean | null): boolean | null;
// }
//
// export class StoredProperties implements IStoredProperties {
//   private _sessionHolder: ISessionHolder;
//   private _authorizationHolder: IAuthorizationHolder;
//   private _authorizationApi: AuthorizationApiService;
//
//   constructor(
//     sessionHolder: ISessionHolder,
//     authorizationHolder: IAuthorizationHolder,
//     authorizationApi: AuthorizationApiService
//   ) {
//     this._sessionHolder = sessionHolder;
//     this._authorizationHolder = authorizationHolder;
//     this._authorizationApi = authorizationApi;
//   }
//
//   async saveProperty(key: string, value: string, belongsTo: BelongsTo): Promise<void> {
//     const request: SaveClientPropertiesRequest = {
//       belongsTo: belongsTo.value,
//       session: this._sessionHolder.sessionToken,
//       properties: [{ key, value }],
//     };
//     await this._authorizationApi.saveClientProperties(request);
//     this.storeClientProperty(key, value);
//   }
//
//   async refreshProperties(): Promise<void> {
//     const clientPropertiesResponse = await this._authorizationApi.getClientProperties({
//       session: this._sessionHolder.sessionToken,
//     });
//     const auth = this._authorizationHolder.getAutorizationResult();
//     auth.info.clientProperties = clientPropertiesResponse.properties;
//   }
//
//   getClientProperty(key: string, def: string | null = null): string | null {
//     const auth = this._authorizationHolder.getAutorizationResult();
//
//     if (!auth || !auth.info.clientProperties) {
//       return def;
//     }
//
//     const property = auth.info.clientProperties.find((prop) => prop.key === key);
//     if (property) {
//       return property.value;
//     }
//     return def;
//   }
//
//   getClientPropertyBool(key: string, def: boolean | null = null): boolean | null {
//     if (def !== null) {
//       return this.getClientProperty(key, def.toString().toLowerCase())?.toLowerCase() === 'true';
//     }
//
//     const res = this.getClientProperty(key);
//     return (res ?? 'false').toLowerCase() === 'true';
//   }
//
//   private storeClientProperty(key: string, value: string): void {
//     const auth = this._authorizationHolder.getAutorizationResult();
//
//     if (!auth || !auth.info) {
//       throw new NoAuthorizationException(`Error storing property (${key}; ${value})`);
//     }
//     if (!auth.info.clientProperties) {
//       auth.info.clientProperties = [];
//     }
//     for (const clientProperty of auth.info.clientProperties) {
//       if (clientProperty.key === key) {
//         clientProperty.value = value;
//         return;
//       }
//     }
//     auth.info.clientProperties.push({ key, value });
//   }
// }
