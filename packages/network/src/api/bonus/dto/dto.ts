// import { networkReflector } from 'network/network';
// import { IBaseRequest } from 'shared/shared';
//
// class AdsRewardAwareRequest implements IBaseRequest {
//   collectAdReward: boolean;
//   session: string;
//   userId: number;
// }
//
// class BaseBonusRequest implements IBaseRequest {
//   session: string;
//   userId: number;
//   startRound: number;
//   timeZoneId: string;
//   type: string;
// }
//
// class Entry {
//   max: number;
//   step: number;
// }
//
// class GameResultsDTO {
//   balanceBonus: number;
//   winIndex: number;
// }
//
// class MiniGameBonusInfoDTO {
//   available: boolean;
//   buttons: MiniGameButtonDto[];
//   configType: string;
//   imageLocation: string;
//   name: string;
// }
//
// class MiniGameBonusResultDTO {
//   bonusFinished: boolean;
//   notSelectedButtons: MiniGameButtonDto[];
//   roundNumber: number;
//   selectedButtons: MiniGameButtonDto[];
//   type: string;
//   userInfo: UserDTO;
//   winnings: MiniGameBonusWinningDTO[];
// }
//
// class MiniGameBonusWinningDTO {
//   params: MapEntryStringValue[];
//   winningAmount: number;
//   winningName: string;
// }
//
// class MiniGameButtonDto {
//   index: number;
//   params: MapEntryStringValue[];
//   type: string;
//   value: number;
// }
//
// class MinigameBonusInfoResponse {
//   miniGameBonusInfo: MiniGameBonusInfoDTO;
// }
//
// class MinigameConfigDTO {
//   conditions: MinigamePlayConditionsDTO;
//   end: number;
//   id: number;
//   name: string;
//   options: MinigameOptionsConfigDTO;
//   rewardCurrency: string;
//   segmentId: number;
//   start: number;
//   type: string;
// }
//
// class MinigameInfoDTO {
//   available: boolean;
//   config: MinigameConfigDTO;
//   currentXp: number;
//   startXp: number;
//   targetXp: number;
// }
//
// class MinigameInfoResponse {
//   minigame: MinigameInfoDTO;
// }
//
// class MinigameOptionsConfigDTO {
//   choices: number;
//   offset: number;
//   step: number;
//   total: number;
// }
//
// class MinigamePlayConditionsDTO {
//   experience: number;
//   level: number;
// }
//
// class PlayMinigameBonusRequest implements IBaseRequest {
//   pickedButtons: number[];
//   roundNumber: number;
//   session: string;
//   userId: number;
// }
//
// class PlayMinigameBonusResponse {
//   result: MiniGameBonusResultDTO;
// }
//
// class PlayMinigameRequest implements IBaseRequest {
//   choice: number;
//   session: string;
//   userId: number;
//   timeZoneId: string;
// }
//
// class PlayMinigameResponse {
//   result: PlayMinigameResultDTO;
// }
//
// class PlayMinigameResultDTO {
//   result: number[];
//   rewardCurrency: string;
//   updatedUser: UserDTO;
//   win: number;
// }
