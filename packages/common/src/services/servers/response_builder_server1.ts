import {
  ConfiguredBetsType,
  ExtraBetDTO,
  IResponseBuilder,
  MachineInfoDTO,
  MachineStateResponse,
  ModularMachineInfoDTO,
  NetworkSymbol,
  ProgressiveJPShortInfoDTO,
  SimpleUserDTO,
  SpinResultResponse,
  UserJackpotStateDto,
  UserState,
  Volatility,
  ShopConfigItemDTO,
  LoginFormConfigDTO,
} from '@cgs/network';

export class ResponseBuilderServer1 implements IResponseBuilder {
  public buildSpinResultResponse(json: Record<string, any>): SpinResultResponse {
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

    const spinResultResponse = new SpinResultResponse({
      bets: json['bets'] ? json['bets'] : null,
      configuredBets: configuredBets,
      contributeToCompetition: json['contributeToCompetition'] ?? null,
      defaultBet: json['defaultBet'] ?? null,
      extraBets: json['extraBets']
        ? json['extraBets'].map((x: any) => ExtraBetDTO.fromJson(x))
        : null,
      featureTotalQualifyBet: json['featureTotalQualifyBet']
        ? new Map(Object.entries(json.featureTotalQualifyBet).map(([k, v]) => [k, Number(v)]))
        : null,
      jackpotInfo: json['jackpotInfo'] ? UserJackpotStateDto.fromJson(json['jackpotInfo']) : null,
      machineState: json['machineState']
        ? MachineStateResponse.fromJson(json['machineState'])
        : null,
      progressiveJPShortInfo: json['progressiveJPShortInfo']
        ? json['progressiveJPShortInfo'].map((x: any) => ProgressiveJPShortInfoDTO.fromJson(x))
        : null,
      savedBets: json['savedBets'] ? json['savedBets'] : null,
      userState: json['userState'] ? UserState.fromJson(json['userState']) : null,
    });

    if (spinResultResponse.machineState?.progressWin) {
      spinResultResponse.userState.userInfo.balance -= spinResultResponse.machineState.progressWin;
    }

    return spinResultResponse;
  }

  public buildMachineInfo(json: Record<string, any>): MachineInfoDTO {
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

    return new MachineInfoDTO({
      betMultiplier: json.betMultiplier ?? null,
      bets: json.bets ? Array.from(json.bets) : null,
      cheatUser: json.cheatUser ?? null,
      configs: json.configs ? Array.from(json.configs) : [],
      cheatCommands: json.commands || [],
      cheatReels: true,
      customCheatInput: false,
      configuredBets: configuredBets,
      defaultBet: json.defaultBet ?? null,
      extraBets: json.extraBets ? json.extraBets.map((x: any) => ExtraBetDTO.fromJson(x)) : null,
      highRolling: json.highRolling ?? null,
      isCheatUser: json.isCheatUser ?? null,
      machineState: json.machineState ? MachineStateResponse.fromJson(json.machineState) : null,
      maxLines: json.maxLines ?? null,
      savedBets: json.savedBets ? Array.from(json.savedBets) : null,
      symbols: json.symbols ? json.symbols.map((x: any) => NetworkSymbol.fromJson(x)) : null,
      userInfo: json.userInfo ? SimpleUserDTO.fromJson(json.userInfo) : null,
      volatilities: json.volatilities
        ? json.volatilities.map((x: any) => Volatility.fromJson(x))
        : null,
      shopGemConfig: (json.shopGemConfig || []).map((item: any) =>
        ShopConfigItemDTO.fromJson(item)
      ),
      shopAdsConfig: (json.shopAdsConfig || []).map((item: any) =>
        ShopConfigItemDTO.fromJson(item)
      ),
      shopGemAndAdsConfig: (json.shopGemAndAdsConfig || []).map((item: any) =>
        ShopConfigItemDTO.fromJson(item)
      ),
      loginFormConfig: json.loginFormConfig
        ? LoginFormConfigDTO.fromJson(json.loginFormConfig)
        : null,
    });
  }

  public buildModularMachineInfo(json: Record<string, any>): ModularMachineInfoDTO {
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

    return new ModularMachineInfoDTO({
      betMultiplier: json.betMultiplier ?? null,
      bets: json.bets ? json.bets.map((x: number) => Number(x)) : null,
      cheatUser: json.cheatUser ?? null,
      configs: json.configs ? json.configs.map((x: string) => String(x)) : null,
      configuredBets: configuredBets,
      defaultBet: json.defaultBet ?? null,
      extraBets: json.extraBets ? json.extraBets.map((x: any) => ExtraBetDTO.fromJson(x)) : null,
      highRolling: json.highRolling ?? null,
      isCheatUser: json.isCheatUser ?? null,
      machineState: json.machineState ? MachineStateResponse.fromJson(json.machineState) : null,
      maxLines: json.maxLines ?? null,
      modulesInfo: json.modulesInfo
        ? Object.entries(json.modulesInfo).reduce(
            (acc: { [key: string]: MachineInfoDTO }, [k, v]) => {
              acc[k] = this.buildModularMachineInfo(v as any);
              return acc;
            },
            {}
          )
        : null,
      savedBets: json.savedBets ? json.savedBets.map((x: number) => Number(x)) : null,
      symbols: json.symbols ? json.symbols.map((x: any) => NetworkSymbol.fromJson(x)) : null,
      userInfo: json.userInfo ? SimpleUserDTO.fromJson(json.userInfo) : null,
      volatilities: json.volatilities
        ? json.volatilities.map((x: any) => Volatility.fromJson(x))
        : null,
      shopGemConfig: (json.shopGemConfig || []).map((item: any) =>
        ShopConfigItemDTO.fromJson(item)
      ),
      shopAdsConfig: (json.shopAdsConfig || []).map((item: any) =>
        ShopConfigItemDTO.fromJson(item)
      ),
      shopGemAndAdsConfig: (json.shopGemAndAdsConfig || []).map((item: any) =>
        ShopConfigItemDTO.fromJson(item)
      ),
      loginFormConfig: json.loginFormConfig
        ? LoginFormConfigDTO.fromJson(json.loginFormConfig)
        : null,
    });
  }
}
