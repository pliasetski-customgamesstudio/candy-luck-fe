import { TStaticResultDTO } from './TStaticResultDTO';
import { TStaticModuleDTO } from './TStaticModuleDTO';
import { SimpleUserDTO } from '../../user/dto/dto';
import { ConfiguredBetsType } from './BonusInfoDTO';

export class TStaticGamesInfoDTO {
  actResult: TStaticResultDTO[] | null;
  configuredBets: ConfiguredBetsType | null;
  crystals: number | null;
  modules: TStaticModuleDTO[] | null;
  nextModules: TStaticModuleDTO[] | null;
  selected: number | null;
  userInfo: SimpleUserDTO | null;

  constructor({
    actResult,
    configuredBets,
    crystals,
    modules,
    nextModules,
    selected,
    userInfo,
  }: {
    actResult: TStaticResultDTO[] | null;
    configuredBets: ConfiguredBetsType | null;
    crystals: number | null;
    modules: TStaticModuleDTO[] | null;
    nextModules: TStaticModuleDTO[] | null;
    selected: number | null;
    userInfo: SimpleUserDTO | null;
  }) {
    this.actResult = actResult;
    this.configuredBets = configuredBets;
    this.crystals = crystals;
    this.modules = modules;
    this.nextModules = nextModules;
    this.selected = selected;
    this.userInfo = userInfo;
  }

  static fromJson(json: any): TStaticGamesInfoDTO {
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

    return new TStaticGamesInfoDTO({
      actResult: json['actResult']
        ? json['actResult'].map((x: any) => TStaticResultDTO.fromJson(x))
        : null,
      configuredBets: configuredBets ?? null,
      crystals: json['crystals'] ?? null,
      modules: json['modules']
        ? json['modules'].map((x: any) => TStaticModuleDTO.fromJson(x))
        : null,
      nextModules: json['nextModules']
        ? json['nextModules'].map((x: any) => TStaticModuleDTO.fromJson(x))
        : null,
      selected: json['selected'] ?? null,
      userInfo: json['userInfo'] ? SimpleUserDTO.fromJson(json['userInfo']) : null,
    });
  }
}
