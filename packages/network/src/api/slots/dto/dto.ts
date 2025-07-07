// class AdditionalDataTypesResponse {
//   baseSpecGroup: BaseSpecGroupDTO;
//   collapsingRound: CollapsingRoundDTO;
//   collapsingSpecGroup: CollapsingSpecGroupDTO;
//   extraWinSymbolsSpecGroup: ExtraWinSymbolsSpecGroupDTO;
//   jackPotsSpecGroup: JackPotsSpecGroupDTO;
//   monopolyGroup: MonopolyGroupDTO;
//   movingSymbols: MovingSymbolsDTO;
//   multiSpinGroup: MultiSpinGroupDTO;
//   pokerWinLine: PokerWinLineDTO;
//   pokerWinLines: PokerWinLinesAdditionalDataDTO;
//   positionSpecGroup: PositionsSpecGroupDTO;
//   reSpinGroup: ReSpinGroupDTO;
//   reSpinRound: ReSpinRoundDTO;
//   winLine: WinLineDTO;
// }
//
// class Any {}
//
// class BaseSpecGroupDTO {
//   type: string;
// }
//
// class BonusButtonDTO {
//   animationStep: number;
//   extraValues: ExtraGainsDTO[];
//   index: number;
//   routingIndex: number;
//   totalValue: number;
//   type: string;
//   value: number;
//   view: string;
// }
//
// class BonusInfoDTO {
//   bonusFinished: boolean;
//   bonusStarted: boolean;
//   bonusType: string;
//   configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
//   currentRound: BonusRoundDTO;
//   freeSpinsInfo: FreeSpinsInfoDTO;
//   bonusInfo: BonusInfoDTO;
//   scatterInfo: BonusInfoDTO;
//   nextRound: BonusRoundDTO;
//   parentSpinId: number;
//   previousRounds: BonusRoundDTO[];
//   result: BonusResultDTO;
//   type: string;
//   userInfo: UserDTO;
// }
//
// class BonusPickRequest implements IBaseRequest {
//   roundNum: number;
//   machineId: string;
//   pickedButtons: number[];
//   sequenceNumber: number;
//   session: string;
//   userId: number;
//   type: string;
// }
//
// class BonusResultDTO {
//   additionWin: number;
//   bet: number;
//   bonusWin: number;
//   lines: number;
//   multiplier: number;
//   specGroups: DefaultSpecGroupDTO[];
//   totalWin: number;
//   winlines: WinLine[];
//   winningName: string;
//   betCalculation: string;
// }
//
// class BonusRoundDTO {
//   attemps: number;
//   attempsUsed: number;
//   cheatButtons: BonusButtonDTO[];
//   notSelectedButtons: BonusButtonDTO[];
//   paytable: RoundPaytableItemDTO[];
//   roundNumber: number;
//   roundType: string;
//   selectedButtons: BonusButtonDTO[];
//   serverSelectedButtons: BonusButtonDTO[];
// }
//
// class CollapsingRoundDTO {
//   defaultSpecGroups: DefaultSpecGroupDTO[];
//   multiplier: number;
//   newReels: number[];
//   positions: number[];
//   roundWin: number;
//   symbolId: number;
//   type: string;
//   winLines: WinLineDTO[];
// }
//
// class CollapsingSpecGroupDTO {
//   groups: CollapsingRoundDTO[];
// }
//
// class DefaultSpecGroupDTO {
//   collectCount: number;
//   positions: number[];
//   positions2d: number[][];
//   positionsWin: number[];
//   previousPositions: number[];
//   previousSymbolId: number;
//   spreadModules: number[];
//   subType: string;
//   symbolId: number;
//   totalWin: number;
//   totalwinDouble: number;
//   type: string;
// }
//
// class DraculaSpecGroupDTO {
//   dJackPotInitialValues: number[];
//   dJackPotValues: number[];
//   jackPotInitialValues: number[];
//   jackPotValues: number[];
//   type: string;
// }
//
// class ExtraWinSymbolsSpecGroupDTO {
//   featureWin: number;
//   positions: number[];
//   symbolId: number;
//   type: string;
//   winBeforeFeature: number;
//   winLines: WinLineDTO[];
// }
//
// class FeatureParametrs {
//   collectCount: number;
//   collectGain: number;
//   collectIndex: number;
//   featureName: string;
//   featuresNames: string[];
//   switchSymbol: number;
//   type: string;
//   weight: number;
// }
//
// class FreeSpinGameCompletionDataDTO {
//   freeSpinCounter: number;
//   freeSpinName: string;
//   totalWin: number;
//   values: JsonMap;
// }
//
// class FreeSpinsGroupDTO {
//   bet: number;
//   betCalculation: string;
//   count: number;
//   lines: number;
//   name: string;
//   usedCount: number;
//   win: number;
// }
//
// class FreeSpinsInfoDTO {
//   currentFreeSpinsGroup: FreeSpinsGroupDTO;
//   event: string;
//   extraEvents: string[];
//   freeSpinGroups: FreeSpinsGroupDTO[];
//   freeSpinsAdded: number;
//   ignoreRebuy: boolean;
//   machineVolatility: number;
//   name: string;
//   parameter: number;
//   parentSpinId: number;
//   totalFreeSpins: number;
//   totalWin: number;
// }
//
// class JackPotsSpecGroupDTO {
//   dJackPotInitialValues: number[];
//   dJackPotValues: number[];
//   jackPotInitialValues: number[];
//   jackPotValues: number[];
//   targetCollectCount: number;
//   type: string;
// }
//
// class MachineInfoDTO {
//   betMultiplier: number;
//   bets: number[];
//   cheatUser: boolean;
//   configs: string[];
//   configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
//   defaultBet: number;
//   extraBets: ExtraBetDTO[];
//   highRolling: boolean;
//   isCheatUser: boolean;
//   machineState: MachineStateResponse;
//   maxLines: number;
//   savedBets: number[];
//   symbols: NetworkSymbol[];
//   userInfo: User;
//   volatilities: Volatility[];
// }
//
// class MachineStateResponse {
//   additionalData: any;
//   additionalType: string;
//   bonusInfo: BonusInfoDTO;
//   defaultSpecGroups: DefaultSpecGroupDTO[];
//   endedFeatures: string[];
//   freeSpinGameCompletionData: FreeSpinGameCompletionDataDTO[];
//   freeSpinsInfo: FreeSpinsInfoDTO;
//   kosProgress: number;
//   lastReels: number[][];
//   machineId: number;
//   scatterInfo: BonusInfoDTO;
//   spinId: number;
//   spinningReelId: string;
//   substituteViews: SubstituteViewDTO[];
//   totalLost: number;
//   totalWin: number;
//   tstaticGamesInfo: TStaticGamesInfoDTO;
//   viewReels: number[][];
//   volatility: number;
//   winLines: WinLineDTO[];
//   winPositions: WinPositionDTO[];
//   winningName: string;
// }
//
// class ModularMachineInfoDTO {
//   betMultiplier: number;
//   bets: number[];
//   cheatUser: boolean;
//   configs: string[];
//   configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
//   defaultBet: number;
//   extraBets: ExtraBetDTO[];
//   highRolling: boolean;
//   isCheatUser: boolean;
//   machineState: MachineStateResponse;
//   maxLines: number;
//   modulesInfo: { [key: string]: MachineInfoDTO };
//   savedBets: number[];
//   symbols: NetworkSymbol[];
//   userInfo: User;
//   volatilities: Volatility[];
// }
//
// class ModularSpinResultResponse {
//   additionalType: string;
//   baseMachineState: MachineStateResponse;
//   bets: number[];
//   challengeProgress: SpinChallengeProgressDTO;
//   contributeToCompetition: boolean;
//   defaultBet: number;
//   featureTotalQualifyBet: { [key: string]: number };
//   jackpotInfo: UserJackpotStateDto;
//   modulesMachineStates: { [key: string]: MachineStateResponse };
//   progressiveJPShortInfo: ProgressiveJPShortInfoDTO[];
//   totalLost: number;
//   totalWin: number;
//   totalWinLines: number;
//   userState: UserState;
//   winningName: string;
//   wordsSpinInfoResponse: WordsSpinInfoResponse;
// }
//
// class ExtraBetDTO {
//   bet: number;
//   effectiveBet: number;
// }
//
// class ExtraGainsDTO {
//   chance: number;
//   type: string;
//   value: number;
// }
//
// class MonopolyGroupDTO {
//   avatarId: number;
//   avatarInit: number;
//   avatarPosition: number;
//   board: SpotGroupDTO[];
//   nextBoard: SpotGroupDTO[];
//   nextTokens: number;
//   tokens: number;
//   attributes: SpotGroupDTO[];
//   updates: UpgradeGroup[];
// }
//
// class MovingPositionDTO {
//   posFrom: number;
//   posTo: number;
//   type: string;
//   value: number;
// }
//
// class MovingSymbolsDTO {
//   current: MovingPositionDTO[];
//   next: MovingPositionDTO[];
// }
//
// class MultiSpinGroupDTO {
//   firstWin: number;
//   groups: MultiSpinRoundDTO[];
//   jackPotsSpecGroup: DraculaSpecGroupDTO;
// }
//
// class MultiSpinRoundDTO {
//   defaultSpecGroups: DefaultSpecGroupDTO[];
//   newViewReels: number[][];
//   totalWin: number;
//   winLines: WinLineDTO[];
//   winPositions: WinPositionDTO[];
// }
//
// class NetworkSymbol {
//   customName: string;
//   featureParametrs: FeatureParametrs;
//   freeSpinGains: number[];
//   freeSpinTypeGains: number[];
//   gains: number[];
//   id: number;
//   stacked: number;
//   type: string;
//   typeGains: number[];
// }
//
// class PokerWinLineDTO {
//   combinationName: string;
//   lineDescription: number[];
//   lineNumber: number;
//   lineSymbols: number[];
//   multiplier: number;
//   positions: number[];
//   realCount: number;
//   symbol: number;
//   win: number;
// }
//
// class PokerWinLinesAdditionalDataDTO {
//   pokerWinLines: PokerWinLineDTO[];
// }
//
// class PositionsSpecGroupDTO {
//   positions: number[];
//   symbolId: number;
//   type: string;
// }
//
// class ProgressiveJPShortInfoDTO {
//   currentUserWin: number;
//   generation: number;
//   giftId: string;
//   highRolling: boolean;
//   jackpotConfigId: number;
//   jpName: string;
// }
//
// class ReSpinGroupDTO {
//   firstWin: number;
//   groups: ReSpinRoundDTO[];
// }
//
// class ReSpinRoundDTO {
//   defaultSpecGroups: DefaultSpecGroupDTO[];
//   fixedPositions: number[];
//   multiplier: number;
//   newReels: number[];
//   newViewReels: number[][];
//   positions: number[];
//   roundWin: number;
//   symbolId: number;
//   type: string;
//   winLines: WinLineDTO[];
//   winPositions: WinPositionDTO[];
//   winningName: string;
// }
//
// class RoundPaytableItemDTO {
//   extraValues: ExtraGainsDTO[];
//   index: number;
//   totalValue: number;
//   type: string;
//   value: number;
// }
//
// class ScatterPickRequest implements IBaseRequest {
//   machineId: string;
//   pickedButtons: number[];
//   scatterRound: number;
//   sequenceNumber: number;
//   session: string;
//   userId: number;
//   type: string;
// }
//
// class SlotCheat {
//   bonus: boolean;
//   command: string;
//   customConfig: string;
//   freeSpins: boolean;
//   reelsPositions: number[][];
//   scatter: boolean;
// }
//
// class SpinChallengeProgressDTO {
//   challengeConfigId: number;
//   stepConfigId: number;
//   taskStates: SpinTaskStateDTO[];
// }
//
// class SpinParams {
//   actionIds: number[];
//   bet: number;
//   betType: string;
//   cheat: SlotCheat;
//   fastSpin: boolean;
//   freeSpin: boolean;
//   lines: number;
//   machineId: string;
//   volatility: number;
// }
//
// class SpinRequest implements IBaseRequest {
//   dynamicProperties: JsonMap;
//   sequenceNumber: number;
//   session: string;
//   userId: number;
//   spinParams: SpinParams;
//   staticProperties: JsonMap;
// }
//
// class SpinResultResponse {
//   bets: number[];
//   configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
//   contributeToCompetition: boolean;
//   defaultBet: number;
//   extraBets: ExtraBetDTO[];
//   featureTotalQualifyBet: { [key: string]: number };
//   jackpotInfo: UserJackpotStateDto;
//   machineState: MachineStateResponse;
//   progressiveJPShortInfo: ProgressiveJPShortInfoDTO[];
//   savedBets: number[];
//   userState: UserStateDTO;
// }
//
// class SpinTaskStateDTO {
//   currentNumber: number;
//   rewarded: boolean;
//   taskConfigId: number;
// }
//
// class SpotGroupDTO {
//   coins: number;
//   subType: string;
//   token: number;
//   type: string;
// }
//
// class StartMachineRequest implements IBaseRequest {
//   dynamicProperties: JsonMap;
//   machineId: string;
//   sequenceNumber: number;
//   session: string;
//   userId: number;
//   staticProperties: JsonMap;
// }
//
// class SubstituteViewDTO {
//   chances: number[];
//   reelId: number;
//   symbols: number[];
// }
//
// class TStaticActionParams implements IBaseRequest {
//   actionId: number;
//   machineId: string;
//   moduleIndex: number;
//   pickIndex: number;
//   sequenceNumber: number;
//   session: string;
//   userId: number;
// }
//
// class TStaticButtonDTO {
//   cost: number;
//   index: number;
//   status: number;
//   type: number;
//   typeName: string;
//   value: number;
// }
//
// class TStaticGamesInfoDTO {
//   actResult: TStaticResultDTO[];
//   configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
//   crystals: number;
//   modules: TStaticModuleDTO[];
//   nextModules: TStaticModuleDTO[];
//   selected: number;
//   userInfo: UserDTO;
// }
//
// class TStaticModuleDTO {
//   attributes: { [key: string]: number };
//   buttons: TStaticButtonDTO[];
//   level: number;
//   name: string;
//   status: number;
// }
//
// class TStaticResultDTO {
//   bet: number;
//   dValue: number;
//   name: string;
//   type: number;
//   value: number;
// }
//
// class UpgradeGroup {
//   id: number;
//   include: UpgradeGroup[];
//   subType: string;
//   type: string;
//   value: number;
//   value2: number;
// }
//
// class User {
//   activeSession: string;
//   affiliateId: string;
//   allPlatformsLastAuthTime: number;
//   avatar: string;
//   balance: number;
//   cheatUser: boolean;
//   contributionBalance: number;
//   createdTime: number;
//   disabled: boolean;
//   displayName: string;
//   dynamicProperties: JsonMap;
//   effectiveSocialId: string;
//   experience: number;
//   forceNotSocial: boolean;
//   gems: number;
//   groups: number;
//   hadRealAuth: boolean;
//   lastAuthTime: number;
//   level: number;
//   lives: number;
//   maxBalance: number;
//   maxBalanceTs: number;
//   name: string;
//   number: number;
//   score: number;
//   socialId: string;
//   socialNetwork: string;
//   staticProperties: JsonMap;
//   tierStartTs: number;
//   userId: number;
// }
//
// class UserJackpotStateDto {
//   coinsWin: number;
//   entryPoints: number;
//   hasEntered: boolean;
//   jackpotId: string;
//   lines: number;
//   points: number;
//   usdWin: number;
//   winner: boolean;
// }
//
// class UserState {
//   newLevelConfig: LevelConfigDTO;
//   newNextLevelConfig: LevelConfigDTO;
//   userInfo: UserDTO;
// }
//
// class UserStateDTO {
//   newLevelConfig: LevelConfigDTO;
//   newNextLevelConfig: LevelConfigDTO;
//   userInfo: UserDTO;
// }
//
// class Volatility {
//   id: number;
//   name: string;
// }
//
// class WinLine {
//   lineNumber: number;
//   multiplier: number;
//   positions: number[];
//   symbol: number;
//   win: number;
// }
//
// class WinLineDTO {
//   lineDescription: number[];
//   lineNumber: number;
//   lineSymbols: number[];
//   multiplier: number;
//   positions: number[];
//   realCount: number;
//   symbol: number;
//   win: number;
// }
//
// class WinPositionDTO {
//   positions: number[];
//   symbol: number;
//   type: string;
//   value: number;
//   winDouble: number;
// }
//
// class WordsSpinInfoResponse {
//   rankOfNewBag: number;
// }
