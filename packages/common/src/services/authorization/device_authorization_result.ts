export class DeviceAuthorizationResult {
  // private _info: AuthorizationInfoDTO;
  // private _success: boolean;
  // private _session: string;
  // private _authorizationKey: string;
  // private _authorizationType: string;
  // private _userAmbiguity: UserAmbiguity;
  // private _clientConfigProperties: ClientConfigPropertyDTO[];
  // private _contentStates: PolicyContentStateDTO[];
  // private _contentConfigs: PolicyContentDTO[];
  // private _isLightWeight: boolean = false;
  //
  // constructor(
  //   info: AuthorizationInfoDTO,
  //   success: boolean,
  //   session: string,
  //   authorizationKey: string,
  //   authorizationType: string,
  //   clientConfigProperties: ClientConfigPropertyDTO[],
  //   userAmbiguity: UserAmbiguity
  // ) {
  //   this._info = info;
  //   this._success = success;
  //   this._session = session;
  //   this._authorizationKey = authorizationKey;
  //   this._authorizationType = authorizationType;
  //   this._clientConfigProperties = clientConfigProperties;
  //   this._userAmbiguity = userAmbiguity;
  // }
  //
  // static fromSlotAuthorizationResponse(
  //   response: SlotAuthorizationResponse
  // ): DeviceAuthorizationResult {
  //   const info = response.authorizationInfo;
  //   if (info.session) {
  //     return new DeviceAuthorizationResult(
  //       info,
  //       true,
  //       info.session,
  //       info.authorizationKey,
  //       info.authorizationType,
  //       info.clientConfigProperties,
  //       null
  //     );
  //   }
  //   return new DeviceAuthorizationResult(
  //     info,
  //     false,
  //     null,
  //     null,
  //     info.authorizationType,
  //     info.clientConfigProperties,
  //     new UserAmbiguity(info.newUser, info.previousUser)
  //   );
  // }
  //
  // static fromApiResponse(info: AuthorizationInfoDTO): DeviceAuthorizationResult {
  //   if (info.session) {
  //     return new DeviceAuthorizationResult(
  //       info,
  //       true,
  //       info.session,
  //       info.authorizationKey,
  //       info.authorizationType,
  //       info.clientConfigProperties,
  //       null
  //     );
  //   }
  //   return new DeviceAuthorizationResult(
  //     info,
  //     false,
  //     null,
  //     null,
  //     info.authorizationType,
  //     info.clientConfigProperties,
  //     new UserAmbiguity(info.newUser, info.previousUser)
  //   );
  // }
  //
  // static fromLightWeightAuthorizationResponse(
  //   response: LightWeightSlotAuthorizationResponse
  // ): DeviceAuthorizationResult {
  //   const info = response.authorizationInfo;
  //   if (info && info.session) {
  //     return (new DeviceAuthorizationResult(
  //       info,
  //       true,
  //       info.session,
  //       info.authorizationKey,
  //       info.authorizationType,
  //       info.clientConfigProperties,
  //       null
  //     ).contentConfigs =
  //       response.contentConfigs.contentStates =
  //       response.contentStates.isLightWeight =
  //         true);
  //   }
  //   return (new DeviceAuthorizationResult(
  //     info,
  //     false,
  //     null,
  //     null,
  //     info.authorizationType,
  //     info.clientConfigProperties,
  //     new UserAmbiguity(info.newUser, info.previousUser)
  //   ).isLightWeight = true);
  // }
  //
  // get contentStates(): PolicyContentStateDTO[] {
  //   return this._contentStates;
  // }
  //
  // set contentStates(value: PolicyContentStateDTO[]) {
  //   this._contentStates = value;
  // }
  //
  // get contentConfigs(): PolicyContentDTO[] {
  //   return this._contentConfigs;
  // }
  //
  // set contentConfigs(value: PolicyContentDTO[]) {
  //   this._contentConfigs = value;
  // }
  //
  // get isLightWeight(): boolean {
  //   return this._isLightWeight;
  // }
  //
  // set isLightWeight(value: boolean) {
  //   this._isLightWeight = value;
  // }
  //
  // get clientConfigProperties(): ClientConfigPropertyDTO[] {
  //   return this._clientConfigProperties;
  // }
  //
  // get authorizationType(): string {
  //   return this._authorizationType;
  // }
  //
  // set authorizationType(value: string) {
  //   this._authorizationType = value;
  // }
  //
  // get authorizationKey(): string {
  //   return this._authorizationKey;
  // }
  //
  // get userAmbiguity(): UserAmbiguity {
  //   return this._userAmbiguity;
  // }
  //
  // get session(): string {
  //   return this._session;
  // }
  //
  // get success(): boolean {
  //   return this._success;
  // }
  //
  // get info(): AuthorizationInfoDTO {
  //   return this._info;
  // }
}
