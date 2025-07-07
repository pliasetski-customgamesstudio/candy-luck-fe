import { MachineStateResponse } from './MachineStateResponse';
import { SpinChallengeProgressDTO } from './SpinChallengeProgressDTO';
import { UserJackpotStateDto } from './UserJackpotStateDto';
import { ProgressiveJPShortInfoDTO } from './ProgressiveJPShortInfoDTO';
import { UserState } from './UserState';
import { WordsSpinInfoResponse } from './WordsSpinInfoResponse';

export class ModularSpinResultResponse {
  additionalType: string | null;
  baseMachineState: MachineStateResponse | null;
  bets: number[] | null;
  challengeProgress: SpinChallengeProgressDTO | null;
  contributeToCompetition: boolean | null;
  defaultBet: number | null;
  featureTotalQualifyBet: Map<string, number> | null;
  jackpotInfo: UserJackpotStateDto | null;
  modulesMachineStates: Map<string, MachineStateResponse>;
  progressiveJPShortInfo: ProgressiveJPShortInfoDTO[] | null;
  totalLost: number | null;
  totalWin: number | null;
  totalWinLines: number | null;
  userState: UserState | null;
  winningName: string | null;
  wordsSpinInfoResponse: WordsSpinInfoResponse | null;

  constructor({
    additionalType,
    baseMachineState,
    bets,
    challengeProgress,
    contributeToCompetition,
    defaultBet,
    featureTotalQualifyBet,
    jackpotInfo,
    modulesMachineStates,
    progressiveJPShortInfo,
    totalLost,
    totalWin,
    totalWinLines,
    userState,
    winningName,
    wordsSpinInfoResponse,
  }: {
    additionalType: string | null;
    baseMachineState: MachineStateResponse | null;
    bets: number[] | null;
    challengeProgress: SpinChallengeProgressDTO | null;
    contributeToCompetition: boolean | null;
    defaultBet: number | null;
    featureTotalQualifyBet: Map<string, number> | null;
    jackpotInfo: UserJackpotStateDto | null;
    modulesMachineStates: Map<string, MachineStateResponse>;
    progressiveJPShortInfo: ProgressiveJPShortInfoDTO[] | null;
    totalLost: number | null;
    totalWin: number | null;
    totalWinLines: number | null;
    userState: UserState | null;
    winningName: string | null;
    wordsSpinInfoResponse: WordsSpinInfoResponse | null;
  }) {
    this.additionalType = additionalType;
    this.baseMachineState = baseMachineState;
    this.bets = bets;
    this.challengeProgress = challengeProgress;
    this.contributeToCompetition = contributeToCompetition;
    this.defaultBet = defaultBet;
    this.featureTotalQualifyBet = featureTotalQualifyBet;
    this.jackpotInfo = jackpotInfo;
    this.modulesMachineStates = modulesMachineStates;
    this.progressiveJPShortInfo = progressiveJPShortInfo;
    this.totalLost = totalLost;
    this.totalWin = totalWin;
    this.totalWinLines = totalWinLines;
    this.userState = userState;
    this.winningName = winningName;
    this.wordsSpinInfoResponse = wordsSpinInfoResponse;
  }

  static fromJson(json: any): ModularSpinResultResponse {
    return new ModularSpinResultResponse({
      additionalType: json.additionalType ?? null,
      baseMachineState: json.baseMachineState
        ? MachineStateResponse.fromJson(json.baseMachineState)
        : null,
      bets: json.bets ? json.bets : null,
      challengeProgress: json.challengeProgress
        ? SpinChallengeProgressDTO.fromJson(json.challengeProgress)
        : null,
      contributeToCompetition: json.contributeToCompetition ?? null,
      defaultBet: json.defaultBet ?? null,
      featureTotalQualifyBet: json.featureTotalQualifyBet
        ? new Map(Object.entries(json.featureTotalQualifyBet).map(([k, v]) => [k, Number(v)]))
        : null,
      jackpotInfo: json.jackpotInfo ? UserJackpotStateDto.fromJson(json.jackpotInfo) : null,
      modulesMachineStates: json.modulesMachineStates
        ? new Map(
            Object.entries(json.modulesMachineStates).map(([key, value]) => [
              key,
              MachineStateResponse.fromJson(value as Record<string, any>),
            ])
          )
        : new Map(),
      progressiveJPShortInfo: Array.isArray(json.progressiveJPShortInfo)
        ? json.progressiveJPShortInfo.map((x: any) => ProgressiveJPShortInfoDTO.fromJson(x))
        : null,
      totalLost: json.totalLost ?? null,
      totalWin: json.totalWin ?? null,
      totalWinLines: json.totalWinLines ?? null,
      userState: json.userState ? UserState.fromJson(json.userState) : null,
      winningName: json.winningName ?? null,
      wordsSpinInfoResponse: json.wordsSpinInfoResponse
        ? WordsSpinInfoResponse.fromJson(json.wordsSpinInfoResponse)
        : null,
    });
  }
}
