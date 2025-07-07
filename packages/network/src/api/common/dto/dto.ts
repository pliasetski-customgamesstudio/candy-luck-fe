// import { networkReflector } from 'network/network';
// import { shared } from 'shared/shared';
//
// @networkReflector
// class ActionExtraParamsDTO {
//   actionLabel: string;
//   actionParams: MapEntryStringValueDTO[];
//   actionType: string;
//   id: number;
//   qualifier: string;
// }
//
// @networkReflector
// class AdvertisementProviderTrackableDataInfo {
//   data: string;
//   providerName: string;
// }
//
// @networkReflector
// class BaseRequest implements IBaseRequest {
//   session: string;
//   userId: number;
// }
//
// @networkReflector
// class BaseResolutionTimeZoneAwareRequest implements IBaseRequest {
//   resolution: string;
//   session: string;
//   userId: number;
//   timeZoneId: string;
// }
//
// @networkReflector
// class BaseTimeZoneAwareRequest implements IBaseRequest {
//   session: string;
//   userId: number;
//   timeZoneId: string;
// }
//
// @networkReflector
// class GameLobbyConfigResponse {
//   action: string;
//   hash: string;
//   notFound: boolean;
//   uri: string;
// }
//
// @networkReflector
// class JsonMap {}
//
// @networkReflector
// class KeyValueActionParam_Double {
//   key: string;
//   value: number;
// }
//
// @networkReflector
// class KeyValueActionParam_String {
//   key: string;
//   value: string;
// }
//
// @networkReflector
// class LevelConfigDTO {
//   balanceBonus: number;
//   baseCoinsValue: number;
//   baseCoinsValueMax: number;
//   challengeBet: number;
//   contributionPoints: number;
//   dailyBonusBet: number;
//   gReelsBonusBet: number;
//   gemsAmount: number;
//   id: number;
//   levelNumber: number;
//   maxLevelNumber: number;
//   minLevelNumber: number;
//   ppDailyRewardBet: number;
//   progressiveBonusBet: number;
//   segmentId: number;
//   startExperience: number;
// }
//
// @networkReflector
// class MapEntryStringValue {
//   key: string;
//   value: string;
// }
//
// @networkReflector
// class MapEntryStringValueDTO {
//   key: string;
//   value: string;
// }
//
// @networkReflector
// class ProgressiveJPPromotionDTO {
//   endTime: number;
//   includeMachines: number[];
//   jackpotType: string;
//   multiplier: number;
//   promotionType: string;
//   timeToEnd: number;
// }
//
// @networkReflector
// class ProgressiveJackPotDTO {
//   currentValue: number;
//   generation: number;
//   minQualifBet: number;
//   name: string;
//   prevValue: number;
//   timeToRecalc: number;
// }
//
// @networkReflector
// class ProgressiveJackPotInfoDTO {
//   id: number;
//   includeMachines: JPMachineConfigDTO[];
//   jackPots: ProgressiveJackPotDTO[];
//   maxLevel: number;
//   minLevel: number;
//   resourceUrl: string;
// }
//
// @networkReflector
// class SyncDataRequest implements IBaseRequest {
//   adjustment: number;
//   metadata: string;
//   session: string;
//   userId: number;
// }
//
// @networkReflector
// class SyncDataResponse {
//   now: number;
// }
//
// @networkReflector
// class TaskProgressDTO {
//   challengeId: number;
//   currentNumber: number;
//   currentNumberDouble: number;
//   taskId: number;
//   totalNumber: number;
//   totalNumberDouble: number;
// }
//
// @networkReflector
// class TrackEventRequest implements IBaseRequest {
//   eventType: string;
//   session: string;
//   userId: number;
// }
//
// @networkReflector
// class UnfinishedFsBonusDTO {
//   bonusType: string;
//   freeSpinCount: number;
//   machineId: number;
// }
//
// @networkReflector
// class UnfinishedFsBonusFeatureRequest implements IBaseRequest {
//   machineIds: number[];
//   session: string;
//   userId: number;
// }
//
// @networkReflector
// class UnfinishedFsBonusFeatureResponse {
//   unfinishedFsBonuses: UnfinishedFsBonusDTO[];
// }
//
// @networkReflector
// class UpdatedUserDTO {
//   balanceDelta: number;
//   buzzerBoosterStatus: string;
//   contestBoosterDelta: number;
//   dailyBonusRound: number;
//   dailyBonusSpinsDelta: number;
//   experienceBoosterDelta: number;
//   experienceBoosterType: string;
//   experienceDelta: number;
//   freeSpinCount: number;
//   gemsDelta: number;
//   levelDelta: number;
//   livesDelta: number;
//   machineId: number;
//   scoreDelta: number;
//   turboWinsBoosterStatus: string;
//   usdDelta: number;
//   user: UserDTO;
//   vipPointsDelta: number;
// }
//

export class UserDTO {
  avatar: string;
  balance: number;
  cheatUser: boolean;
  contributionBalance: number;
  createdTime: number;
  displayName: string;
  effectiveSocialId: string;
  experience: number;
  forceNotSocial: boolean;
  gems: number;
  level: number;
  name: string;
  socialId: string;
  socialNetwork: string;
  userId: string;
}
