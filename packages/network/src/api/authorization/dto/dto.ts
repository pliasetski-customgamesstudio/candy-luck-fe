// import { networkReflector, GenericInfo, IBaseRequest } from 'network/network';
// import { Pair } from 'shared/shared';
//
// class AuthorizationInfoDTO implements IBaseRequest {
//   authId: number;
//   authorizationKey: string;
//   authorizationType: string;
//   clientConfigProperties: ClientConfigPropertyDTO[];
//   clientProperties: ClientPropertyDTO[];
//   firstAuth: boolean;
//   newUser: UserDTO;
//   platformId: string;
//   previousUser: UserDTO;
//   serverTs: number;
//   session: string;
//   socialToken: string;
//   userId: number;
// }
//
// class AuthorizeByKeyRequest {
//   appVersion: string;
//   auxAttributionInfo: AuxAttributionInfo;
//   installationParams: InstallationParams;
//   key: string;
//   timeZoneId: string;
// }
//
// class AuthorizeRequest {
//   advAttributionInfoList: AdvertisementProviderTrackableDataInfo[];
//   auxAttributionInfo: AuxAttributionInfo;
//   deviceInfo: DeviceAuthorizationInfo;
//   installationParams: InstallationParams;
//   key: string;
//   selectedUser: string;
//   socialInfo: SocialAuthorizationInfo;
//   timeZoneId: string;
//   track: boolean;
// }
//
// class AuxAttributionInfo {
//   adProviderUniqueDeviceId: string;
//   ad_id: string;
//   adset_id: string;
//   affiliateId: string;
//   campaignId: string;
//   parameters: Pair[];
//   requestIds: string[];
//   trackerId: string;
// }
//
// class ChangePolicyContentStateRequest implements IBaseRequest {
//   policyContentStates: PolicyContentState[];
//   session: string;
//   userId: number;
// }
//
// class ClientConfigPropertyDTO {
//   isDefault: boolean;
//   key: string;
//   type: string;
//   value: string;
// }
//
// class ClientConfigResponse {
//   properties: ClientConfigPropertyDTO[];
// }
//
// class ClientPropertiesResponse {
//   properties: ClientPropertyDTO[];
// }
//
// class ClientPropertyDTO {
//   key: string;
//   value: string;
// }
//
export class DeviceAuthorizationInfo {
  advertiserId: string;
  androidId: string;
  appVersion: string;
  appVersionInteger: number;
  browser: string;
  device: string;
  email: string;
  id: number;
  imei: string;
  ipAddress: string;
  ipCity: string;
  ipCountry: string;
  locale: string;
  macAddress: string;
  os: string;
  osVersion: string;
  password: string;
  platform: string;
  region: string;
  renderTechnology: string;
  resolution: string;
  serialNumber: string;
  type: string;
  uniqueDeviceId: string;
  userCountry: string;
  vendorId: string;
}
//
// class GetPolicyContentStateRequest implements IBaseRequest {
//   policyContentType: string[];
//   session: string;
//   userId: number;
// }
//
// class GetPolicyContentStateResponse {
//   contentConfigs: PolicyContentDTO[];
//   contentStates: PolicyContentStateDTO[];
// }
//
// class InstallationParams {
//   adGroup: string;
//   adGroupId: string;
//   adId: string;
//   adProviderUniqueDeviceId: string;
//   adset: string;
//   adsetId: string;
//   afSiteId: string;
//   afStatus: string;
//   afSub1: string;
//   afSub2: string;
//   afSub3: string;
//   afSub4: string;
//   afSub5: string;
//   agency: string;
//   campaign: string;
//   campaignId: string;
//   clickId: string;
//   mediaSource: string;
//   tracker: string;
// }
//
// class LightWeightSlotAuthorizationResponse {
//   authorizationInfo: AuthorizationInfoDTO;
//   contentConfigs: PolicyContentDTO[];
//   contentStates: PolicyContentStateDTO[];
// }
//
// class Pair {
//   key: string;
//   value: string;
// }
//
// class PolicyContent {
//   minVersion: number;
//   type: string;
//   version: number;
// }
//
// class PolicyContentDTO {
//   minVersion: number;
//   type: string;
//   version: number;
// }
//
// class PolicyContentState {
//   policyContent: PolicyContent;
//   state: string;
// }
//
// class PolicyContentStateDTO {
//   policyContent: PolicyContentDTO;
//   state: string;
// }
//
// class SaveClientPropertiesRequest implements IBaseRequest {
//   belongsTo: string;
//   properties: ClientPropertyDTO[];
//   session: string;
//   userId: number;
// }
//
// class SawPolicyContentRequest implements IBaseRequest {
//   policyContents: PolicyContent[];
//   session: string;
//   userId: number;
// }
//
// class SlotAuthorizationResponse {
//   authorizationInfo: AuthorizationInfoDTO;
//   slotGameLobbyConfig: GameLobbyConfigResponse;
// }
//
// class SlotAuthorizeRequest {
//   additionalData: string[];
//   advAttributionInfoList: AdvertisementProviderTrackableDataInfo[];
//   auxAttributionInfo: AuxAttributionInfo;
//   deviceInfo: DeviceAuthorizationInfo;
//   installationParams: InstallationParams;
//   key: string;
//   resolution: string;
//   selectedUser: number;
//   socialInfo: SocialAuthorizationInfo;
//   timeZoneId: string;
//   track: boolean;
// }
//
// class SocialAuthorizationInfo {
//   socialNetwork: string;
//   socialToken: string;
// }
//
// class TrackAuxAttributionRequest implements IBaseRequest {
//   auxAttributionInfo: AuxAttributionInfo;
//   session: string;
//   userId: number;
// }
//
// class TrackInstallationRequest implements IBaseRequest {
//   installationParams: InstallationParams;
//   session: string;
//   userId: number;
// }
//
// class UpdateSocialAuthorizationRequest implements IBaseRequest {
//   session: string;
//   userId: number;
//   socialInfo: SocialAuthorizationInfo;
// }
