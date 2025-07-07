import { ExtraBetDTO } from './ExtraBetDTO';
import { MachineStateResponse } from './MachineStateResponse';
import { Volatility } from './Volatility';
import { NetworkSymbol } from './NetworkSymbol';
import { SimpleUserDTO } from '../../user/dto/dto';
import { ConfiguredBetsType } from './BonusInfoDTO';
import { ShopConfigItemDTO } from './ShopConfigItemDTO';
import { LoginFormConfigDTO } from './LoginFormConfigDTO';

export class MachineInfoDTO {
  betMultiplier: number | null;
  bets: number[] | null;
  cheatUser: boolean | null;
  configs: string[] | null;
  cheatCommands: string[] | null;
  cheatReels: boolean;
  customCheatInput: boolean;
  configuredBets: ConfiguredBetsType | null;
  defaultBet: number | null;
  extraBets: ExtraBetDTO[] | null;
  highRolling: boolean | null;
  isCheatUser: boolean | null;
  machineState: MachineStateResponse | null;
  maxLines: number | null;
  savedBets: number[] | null;
  symbols: NetworkSymbol[] | null;
  userInfo: SimpleUserDTO | null;
  volatilities: Volatility[] | null;
  shopGemConfig: ShopConfigItemDTO[];
  shopAdsConfig: ShopConfigItemDTO[];
  shopGemAndAdsConfig: ShopConfigItemDTO[];
  loginFormConfig: LoginFormConfigDTO | null;

  constructor({
    betMultiplier,
    bets,
    cheatUser,
    configs,
    cheatCommands = [],
    cheatReels = true,
    customCheatInput = false,
    configuredBets,
    defaultBet,
    extraBets,
    highRolling,
    isCheatUser,
    machineState,
    maxLines,
    savedBets,
    symbols,
    userInfo,
    volatilities,
    shopGemConfig,
    shopAdsConfig,
    shopGemAndAdsConfig,
    loginFormConfig,
  }: {
    betMultiplier: number | null;
    bets: number[] | null;
    cheatUser: boolean | null;
    configs: string[] | null;
    cheatCommands?: string[] | null;
    cheatReels?: boolean;
    customCheatInput?: boolean;
    configuredBets: ConfiguredBetsType | null;
    defaultBet: number | null;
    extraBets: ExtraBetDTO[] | null;
    highRolling: boolean | null;
    isCheatUser: boolean | null;
    machineState: MachineStateResponse | null;
    maxLines: number | null;
    savedBets: number[] | null;
    symbols: NetworkSymbol[] | null;
    userInfo: SimpleUserDTO | null;
    volatilities: Volatility[] | null;
    shopGemConfig: ShopConfigItemDTO[];
    shopAdsConfig: ShopConfigItemDTO[];
    shopGemAndAdsConfig: ShopConfigItemDTO[];
    loginFormConfig: LoginFormConfigDTO | null;
  }) {
    this.betMultiplier = betMultiplier;
    this.bets = bets;
    this.cheatUser = cheatUser;
    this.configs = configs;
    this.cheatCommands = cheatCommands;
    this.cheatReels = cheatReels;
    this.customCheatInput = customCheatInput;
    this.configuredBets = configuredBets;
    this.defaultBet = defaultBet;
    this.extraBets = extraBets;
    this.highRolling = highRolling;
    this.isCheatUser = isCheatUser;
    this.machineState = machineState;
    this.maxLines = maxLines;
    this.savedBets = savedBets;
    this.symbols = symbols;
    this.userInfo = userInfo;
    this.volatilities = volatilities;
    this.shopGemConfig = shopGemConfig;
    this.shopAdsConfig = shopAdsConfig;
    this.shopGemAndAdsConfig = shopGemAndAdsConfig;
    this.loginFormConfig = loginFormConfig;
  }
}
