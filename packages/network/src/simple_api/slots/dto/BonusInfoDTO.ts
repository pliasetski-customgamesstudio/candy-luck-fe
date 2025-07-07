import { BonusRoundDTO } from './BonusRoundDTO';
import { FreeSpinsInfoDTO } from './FreeSpinsInfoDTO';
import { BonusResultDTO } from './BonusResultDTO';
import { SimpleUserDTO } from '../../user/dto/dto';

export type ConfiguredBetsType = Record<string, Record<string, Record<number, number[]>>>;

export class BonusInfoDTO {
  bonusFinished: boolean | null;
  bonusStarted: boolean | null;
  bonusType: string | null;
  configuredBets: ConfiguredBetsType | null;
  currentRound: BonusRoundDTO | null;
  freeSpinsInfo: FreeSpinsInfoDTO | null;
  bonusInfo: BonusInfoDTO | null;
  scatterInfo: BonusInfoDTO | null;
  nextRound: BonusRoundDTO | null;
  parentSpinId: number | null;
  previousRounds: BonusRoundDTO[] | null;
  result: BonusResultDTO | null;
  type: string | null;
  userInfo: SimpleUserDTO | null;

  constructor(
    bonusFinished: boolean | null,
    bonusStarted: boolean | null,
    bonusType: string | null,
    configuredBets: ConfiguredBetsType | null,
    currentRound: BonusRoundDTO | null,
    freeSpinsInfo: FreeSpinsInfoDTO | null,
    bonusInfo: BonusInfoDTO | null,
    scatterInfo: BonusInfoDTO | null,
    nextRound: BonusRoundDTO | null,
    parentSpinId: number | null,
    previousRounds: BonusRoundDTO[] | null,
    result: BonusResultDTO | null,
    type: string | null,
    userInfo: SimpleUserDTO | null
  ) {
    this.bonusFinished = bonusFinished;
    this.bonusStarted = bonusStarted;
    this.bonusType = bonusType;
    this.configuredBets = configuredBets;
    this.currentRound = currentRound;
    this.freeSpinsInfo = freeSpinsInfo;
    this.bonusInfo = bonusInfo;
    this.scatterInfo = scatterInfo;
    this.nextRound = nextRound;
    this.parentSpinId = parentSpinId;
    this.previousRounds = previousRounds;
    this.result = result;
    this.type = type;
    this.userInfo = userInfo;
  }

  static fromJson(json: any): BonusInfoDTO {
    let configuredBets: ConfiguredBetsType | null = null;

    if (json['configuredBets']) {
      configuredBets = Object.entries(json['configuredBets']).reduce((acc, [key, value]) => {
        const valueAsObject = value as { [innerKey: string]: any };
        acc[key] = Object.entries(valueAsObject).reduce(
          (innerAcc, [innerKey, innerValue]) => {
            const innerValueAsObject = innerValue as { [innerInnerKey: string]: any };
            innerAcc[innerKey] = Object.entries(innerValueAsObject).reduce(
              (innerInnerAcc, [innerInnerKey, innerInnerValue]) => {
                innerInnerAcc[parseFloat(innerInnerKey)] = (innerInnerValue as any[]).map((v) =>
                  parseFloat(v)
                );
                return innerInnerAcc;
              },
              {} as { [k: number]: number[] }
            );
            return innerAcc;
          },
          {} as { [k: string]: { [k: number]: number[] } }
        );
        return acc;
      }, {} as ConfiguredBetsType);
    }

    return new BonusInfoDTO(
      json['bonusFinished'] ?? null,
      json['bonusStarted'] ?? null,
      json['bonusType'] ?? null,
      configuredBets,
      json['currentRound'] ? BonusRoundDTO.fromJson(json['currentRound']) : null,
      json['freeSpinsInfo'] ? FreeSpinsInfoDTO.fromJson(json['freeSpinsInfo']) : null,
      json['bonusInfo'] ? BonusInfoDTO.fromJson(json['bonusInfo']) : null,
      json['scatterInfo'] ? BonusInfoDTO.fromJson(json['scatterInfo']) : null,
      json['nextRound'] ? BonusRoundDTO.fromJson(json['nextRound']) : null,
      json['parentSpinId'],
      json['previousRounds']
        ? json['previousRounds'].map((x: any) => BonusRoundDTO.fromJson(x))
        : null,
      json['result'] ? BonusResultDTO.fromJson(json['result']) : null,
      json['type'] ?? null,
      json['userInfo'] ? SimpleUserDTO.fromJson(json['userInfo']) : null
    );
  }
}
