import { ExtraBetDTO } from './ExtraBetDTO';
import { UserJackpotStateDto } from './UserJackpotStateDto';
import { MachineStateResponse } from './MachineStateResponse';
import { ProgressiveJPShortInfoDTO } from './ProgressiveJPShortInfoDTO';
import { UserState } from './UserState';
import { ConfiguredBetsType } from './BonusInfoDTO';

export class SpinResultResponse {
  bets: number[] | null;
  configuredBets: ConfiguredBetsType | null;
  contributeToCompetition: boolean | null;
  defaultBet: number | null;
  extraBets: ExtraBetDTO[] | null;
  featureTotalQualifyBet: Map<string, number> | null;
  jackpotInfo: UserJackpotStateDto | null;
  machineState: MachineStateResponse | null;
  progressiveJPShortInfo: ProgressiveJPShortInfoDTO[] | null;
  savedBets: number[] | null;
  userState: UserState;

  gameRoundType: number;

  constructor({
    bets,
    configuredBets,
    contributeToCompetition,
    defaultBet,
    extraBets,
    featureTotalQualifyBet,
    jackpotInfo,
    machineState,
    progressiveJPShortInfo,
    savedBets,
    userState,
    gameRoundType,
  }: {
    bets: number[] | null;
    configuredBets: ConfiguredBetsType | null;
    contributeToCompetition: boolean | null;
    defaultBet: number | null;
    extraBets: ExtraBetDTO[] | null;
    featureTotalQualifyBet: Map<string, number> | null;
    jackpotInfo: UserJackpotStateDto | null;
    machineState: MachineStateResponse | null;
    progressiveJPShortInfo: ProgressiveJPShortInfoDTO[] | null;
    savedBets: number[] | null;
    userState: UserState | null;
    gameRoundType?: number;
  }) {
    this.bets = bets;
    this.configuredBets = configuredBets;
    this.contributeToCompetition = contributeToCompetition;
    this.defaultBet = defaultBet;
    this.extraBets = extraBets;
    this.featureTotalQualifyBet = featureTotalQualifyBet;
    this.jackpotInfo = jackpotInfo;
    this.machineState = machineState;
    this.progressiveJPShortInfo = progressiveJPShortInfo;
    this.savedBets = savedBets;
    this.userState = userState as UserState;
    this.gameRoundType = gameRoundType || 0;
  }
}
