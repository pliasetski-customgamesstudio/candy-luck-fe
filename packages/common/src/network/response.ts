import {
  Volatility,
  MachineStateResponse,
  ShopConfigItemDTO,
  LoginFormConfigDTO,
} from '@cgs/network';

export interface IBonusResponse {
  type: string;
  bonusType: string;
  configuredBets: Record<string, Record<string, Record<number, number[]>>> | null;
  result: IBonusResult | null;
  nextRound: IBonusRound | null;
  currentRound: IBonusRound | null;
  freeSpinsInfo: InternalFreeSpinsInfo | null;
  bonusInfo: IBonusResponse | null;
  scatterInfo: IBonusResponse | null;
  freeSpinReBuyInfo: FreeSpinReBuyInfoResponse | null;
  previousRounds: IBonusRound[] | null;
  bonusFinished: boolean;
  bonusStarted: boolean;
  userParlayInfo: IBonusUserParlayInfo;
}

export interface IBonusResult {
  bonusWin: number;
  totalWin: number;
  specGroups: SpecialSymbolGroup[] | null;
  additionWin: number;
  multiplier: number;
  bet: number;
  lines: number;
  winName: string;
  winLines: Line[] | null;
  betCalculation: string;
}

export interface IBonusUserParlayInfo {
  isUserParlayFinished: boolean;
}

export class InternalFreeSpinsGroup {
  count: number | null;
  usedCount = 0;
  lines: number;
  name: string | null;
  bet: number;
  marker: string | null;
  win: number;
  betCalculation: string;
}

export class InternalFreeSpinsInfo {
  name: string;
  freeSpinGroups: (InternalFreeSpinsGroup | null)[] | null;
  extraEvents: string[] | null;
  totalWin: number;
  freeSpinsAdded: number | null;
  currentFreeSpinsGroup: InternalFreeSpinsGroup | null;
  totalFreeSpins: number;
  event: string;
  parameter: number;
}

export class InternalCollapsingRound {
  // @GenericInfo(Number)
  newReels: number[];
  // @GenericInfo(Number)
  positions: number[];
  // @GenericInfo(Line)
  winLines: Line[];
  type: string;
  multiplier: number;
  roundWin: number;
  // @GenericInfo(SpecialSymbolGroup)
  specialSymbolGroups: SpecialSymbolGroup[] | null;
}

export class InternalRespinRound {
  newViewReels: number[][];
  fixedPositions: number[];
  winLines: Line[];
  winPositions: ReelWinPosition[];
  type: string;
  multiplier: number;
  roundWin: number;
  winName: string;
  specialSymbolGroups: SpecialSymbolGroup[] | null;
}

export class InternalPokerWinLinesData {
  winLines: Line[];
}

export interface IBonusRound {
  notSelectedButtons: IRoundButton[] | null;
  selectedButtons: IRoundButton[] | null;
  serverSelectedButtons: IRoundButton[] | null;
  paytable: IRoundPaytableItem[] | null;
  roundType: string;
  roundNumber: number;
  attemps: number;
  attempsUsed: number;
}

// @networkReflector
export class InternalCollapsingSpecGroup {
  collapsingCounter = 0;
  get currentRound(): InternalCollapsingRound {
    return this.groups[this.collapsingCounter];
  }
  // @GenericInfo(InternalCollapsingRound)
  groups: InternalCollapsingRound[];
}

export class InternalRespinSpecGroup {
  respinStarted = false;
  respinCounter = 0;
  respinStartedCounter = 0;
  get currentRound(): InternalRespinRound {
    return this.groups[this.respinCounter];
  }
  groups: InternalRespinRound[];
  firstWin: number;
}

export class InternalJackpotsSpecGroup {
  jackPotValues: number[];
  jackPotInitialValues: number[];
  targetCollectCount: number;
}

export class InternalMultiSpinGroup {
  firstWin: number;
  groups: InternalMultiSpinRound[];
  jackPotsSpecGroup: InternalDraculaSpecGroup;
}

export class InternalMultiSpinRound {
  defaultSpecGroups: SpecialSymbolGroup[];
  newViewReels: number[][];
  totalWin: number;
  winLines: Line[];
  winPositions: ReelWinPosition[];
}

export class InternalDraculaSpecGroup {
  dJackPotInitialValues: number[];
  dJackPotValues: number[];
  jackPotInitialValues: number[];
  jackPotValues: number[];
  type: string;
}

export class InternalBoard {
  type: string;
  subType: string;
  token: number;
  coins: number;
}

export class InternalBoardSpecGroup {
  tokens: number;
  nextTokens: number;
  avatarId: number;
  avatarInit: number;
  avatarPosition: number;
  attributes: InternalBoard[];
  board: InternalBoard[];
  nextBoard: InternalBoard[];
  update: InternalBoardUpdate[];
}

export class InternalUpdateInclude {
  type: string;
  subType: string;
  id: number;
  value: number;
  value2: number;
  include: InternalUpdateInclude[];
}

export class InternalBoardUpdate {
  type: string;
  subType: string;
  id: number;
  value: number;
  value2: number;
  include: InternalUpdateInclude[];
}

export class InternalMovingSymbols {
  current: InternalMovingPosition[];
  next: InternalMovingPosition[];
}

export class InternalMovingPosition {
  posTo: number;
  posFrom: number;
  type: string;
  value: number;
}

export enum ErrorLevel {
  None,
  Critical,
  Handled,
  SpinLimitExceeded,
}

export class InternalBaseSpecGroup {
  type: string;
}

export class InternalExtraWinSymbolsSpecGroup {
  winBeforeFeature: number;
  positions: number[];
  symbolId: number;
  winLines: Line[];
  featureWin: number;
  type: string;
}

export enum BetCalculationType {
  DEFAULT,
  AVERAGE,
  FREESPINS,
}

export class InternalBet {
  //implements Comparable<InternalBet> {
  get isExtraBet(): boolean {
    return this.effectiveBet > 0;
  }
  effectiveBet = -1.0;
  bet: number;
  isXtremeBet = false;
  calculationType: BetCalculationType;
  compareTo(other: InternalBet): number {
    return this.bet - other.bet;
  }
  equals(other: any): boolean {
    if (this.isExtraBet || other.isExtraBet) {
      return this.effectiveBet === other.effectiveBet;
    }
    return this.bet === other.bet;
  }
}

export interface ISlotMachineInfo {
  bets: InternalBet[];
  volatilities: Volatility[];
  tutorialInfo: TutorialInfo;
  freeSpinGameCompletionData: FreeSpinGameCompletionDataResponse[] | null;
  cheatUser: boolean;
  defaultBet: number;
  configuredBets: Record<string, Record<string, Record<number, number[]>>>;
  betMultiplier: number;
  maxLines: number;
  symbols: MachineSymbol[];
  machineState: MachineStateResponse;
  configs: string[];
  cheatCommands: string[];
  cheatReels: boolean;
  customCheatInput: boolean;
  lines: number[];
  spinResult: ISpinResponse;
  currentVolatility: number;
  xtremeBetInfo: XtremeBetInfo;
  staticModulesShopInfo: StaticModulesShopInfo;
  shopGemConfig: ShopConfigItemDTO[];
  shopAdsConfig: ShopConfigItemDTO[];
  shopGemAndAdsConfig: ShopConfigItemDTO[];
  loginFormConfig: LoginFormConfigDTO | null;
}

export interface IModularSlotMachineInfo extends ISlotMachineInfo {
  modularSpinResult: IModularSpinResponse;
  modulesInfo: Record<string, SlotMachineModuleInfo>;
}

export class SlotMachineInfo implements ISlotMachineInfo {
  bets: InternalBet[];
  volatilities: Volatility[];
  tutorialInfo: TutorialInfo;
  cheatUser: boolean;
  defaultBet: number;
  configuredBets: Record<string, Record<string, Record<number, number[]>>>;
  betMultiplier: number;
  maxLines: number;
  symbols: MachineSymbol[];
  machineState: MachineStateResponse;
  lines: number[];
  configs: string[];
  cheatCommands: string[];
  cheatReels: boolean;
  customCheatInput: boolean;
  freeSpinGameCompletionData: FreeSpinGameCompletionDataResponse[] | null;
  spinResult: ISpinResponse;
  currentVolatility: number;
  xtremeBetInfo: XtremeBetInfo;
  staticModulesShopInfo: StaticModulesShopInfo;
  shopGemConfig: ShopConfigItemDTO[];
  shopAdsConfig: ShopConfigItemDTO[];
  shopGemAndAdsConfig: ShopConfigItemDTO[];
  loginFormConfig: LoginFormConfigDTO | null;
}

export class ModularSlotMachineInfo extends SlotMachineInfo implements IModularSlotMachineInfo {
  modularSpinResult: IModularSpinResponse;
  modulesInfo: Record<string, SlotMachineModuleInfo>;
}

export class SlotMachineModuleInfo {
  maxLines: number;
  symbols: MachineSymbol[];
  machineState: MachineStateResponse;
  lines: number[];
}

export interface ISpinResponse {
  reelState: ReelState;
  viewReels: number[][];
  winLines: Line[];
  winPositions: ReelWinPosition[];
  specialSymbolGroups: SpecialSymbolGroup[] | null;
  substituteReelViews: SubstituteReelViews[];
  spinningReelId: string;
  additionalData: any;
  totalWin: number;
  progressWin: number;
  totalLost: number;
  freeSpinsInfo: InternalFreeSpinsInfo | null;
  bonusInfo: IBonusResponse | null;
  scatterInfo: IBonusResponse | null;
  isBonus: boolean;
  isScatter: boolean;
  isFreeSpins: boolean;
  isRespin: boolean;
  isFakeResponse: boolean;
  collectedSymbolCount: number;
  bigWinName: string;
  errorLevel: ErrorLevel;
  errorMessage: string;
  freeSpinReBuyInfo: FreeSpinReBuyInfoResponse;
  freeSpinGameCompletionData: FreeSpinGameCompletionDataResponse[];
  clearWinLines(): void;
  clearWinPositions(): void;
  bets: InternalBet[];
  defaultBet: number;
  configuredBets: Record<string, Record<string, Record<number, number[]>>>;
  volatility: number;
  xtremeBetInfo: XtremeBetInfo;
}

export interface IModularSpinResponse extends ISpinResponse {
  moduleReelStates: Record<string, ReelState>;
  totalWinWithModules: number;
  totalLostWithModules: number;
}

export class SpinResponse implements ISpinResponse {
  freeSpinGameCompletionData: FreeSpinGameCompletionDataResponse[];
  volatility: number;
  reelState: ReelState = new ReelState();
  get viewReels(): number[][] {
    return this.reelState.viewReels;
  }
  set viewReels(value: number[][]) {
    this.reelState.viewReels = value;
  }
  get winLines(): Line[] {
    return this.reelState.winLines;
  }
  set winLines(value: Line[]) {
    this.reelState.winLines = value;
  }
  get winPositions(): ReelWinPosition[] {
    return this.reelState.winPositions;
  }
  set winPositions(value: ReelWinPosition[]) {
    this.reelState.winPositions = value;
  }
  get specialSymbolGroups(): SpecialSymbolGroup[] | null {
    return this.reelState.specialSymbolGroups;
  }
  set specialSymbolGroups(value: SpecialSymbolGroup[] | null) {
    this.reelState.specialSymbolGroups = value;
  }
  get substituteReelViews(): SubstituteReelViews[] {
    return this.reelState.substituteReelViews;
  }
  set substituteReelViews(value: SubstituteReelViews[]) {
    this.reelState.substituteReelViews = value;
  }
  get spinningReelId(): string {
    return this.reelState.spinningReelId;
  }
  set spinningReelId(value: string) {
    this.reelState.spinningReelId = value;
  }
  get additionalData(): any {
    return this.reelState.additionalData;
  }
  set additionalData(value: any) {
    this.reelState.additionalData = value;
  }
  get totalWin(): number {
    return this.reelState.totalWin;
  }
  set totalWin(value: number) {
    this.reelState.totalWin = value;
  }
  get totalLost(): number {
    return this.reelState.totalLost;
  }
  set totalLost(value: number) {
    this.reelState.totalLost = value;
  }
  get progressWin(): number {
    return this.reelState.progressWin;
  }
  set progressWin(value: number) {
    this.reelState.progressWin = value;
  }
  freeSpinsInfo: InternalFreeSpinsInfo | null;
  bonusInfo: IBonusResponse | null;
  scatterInfo: IBonusResponse | null;
  get isBonus(): boolean {
    return !!this.bonusInfo;
  }
  get isScatter(): boolean {
    return !!this.scatterInfo;
  }
  get isFreeSpins(): boolean {
    return !!this.freeSpinsInfo;
  }
  isRespin = false;
  isFakeResponse = false;
  collectedSymbolCount: number;
  bigWinName: string;
  errorLevel: ErrorLevel;
  errorMessage: string;
  freeSpinReBuyInfo: FreeSpinReBuyInfoResponse;
  clearWinLines(): void {
    if (this.winLines) {
      this.winLines.length = 0;
    }
  }
  clearWinPositions(): void {
    if (this.winPositions) {
      this.winPositions.length = 0;
    }
  }
  bets: InternalBet[];
  defaultBet: number;
  configuredBets: Record<string, Record<string, Record<number, number[]>>>;
  xtremeBetInfo: XtremeBetInfo;
}

export class ModularSpinResponse extends SpinResponse implements IModularSpinResponse {
  moduleReelStates: Record<string, ReelState>;
  totalWinWithModules: number;
  totalLostWithModules: number;
  get totalWin(): number {
    return this.totalLostWithModules;
  }
  get totalLost(): number {
    return this.totalLostWithModules;
  }
  clearWinLines(): void {
    super.clearWinLines();
    Object.values(this.moduleReelStates).forEach((reelState) => {
      if (reelState?.winLines) {
        reelState.winLines.length = 0;
      }
    });
  }
  clearWinPositions(): void {
    super.clearWinPositions();
    Object.values(this.moduleReelStates).forEach((reelState) => {
      if (reelState?.winPositions) {
        reelState.winPositions.length = 0;
      }
    });
  }
}

export class FreeSpinReBuyInfoResponse {
  spinCount: number;
  paymentOption: SpinPaymentOption;
  specialSymbolGroups: SpecialSymbolGroup[] | null;
}

export class SpinPaymentOption {
  discountInPercent: number;
  contributionPoints: number;
  isDefault: boolean;
  price: number;
  enabled: boolean;
  providerProductId: string;
  startValue: number;
  platform: number;
  endValue: number;
  fake: boolean;
  type: string;
  name: string;
  id: number;
  subscription: boolean;
  extraParams: Record<string, string>;
}

export interface IExtraGain {
  type: string;
  value: number;
}

export interface IRoundButton {
  type: string;
  value: number;
  totalValue: number;
  index: number;
  view: string;
  routingIndex: number;
  extraValues: IExtraGain[];
}

export class MachineSymbol {
  gains: number[] | null;
  typeGains: number[] | null;
  id: number;
  stacked: number;
  type: string;
}

export interface IRoundPaytableItem {
  type: string;
  value: number;
  totalValue: number;
  index: number;
  extraValues: IExtraGain[];
}

// @networkReflector
export class Line {
  lineIndex: number;
  // @GenericInfo(Number)
  iconsIndexes: number[];
  winAmount: number;
  multiplier: number | null;
  symbolId: number | null;
  winName: string;

  constructor(iconsIndexes: number[] = []) {
    this.iconsIndexes = iconsIndexes;
  }
}

export class TutorialInfo {
  tutorialFinished: boolean;
}

export class ReelWinPosition {
  positions: number[];
  type: string;
  symbol: number | null;
  win: number;

  constructor(positions: number[], type: string, symbol: number | null, win: number) {
    this.positions = positions;
    this.type = type;
    this.symbol = symbol;
    this.win = win;
  }
}

export class FreeSpinGameCompletionDataResponse {
  totalWin: number;
  freeSpinCounter: number;
  freeSpinName: string;
}

export class SubstituteReelViews {
  chances: number[];
  reelId: number;
  symbols: number[];
}

export class WildPosition {
  position: number;
}

export class SpecialSymbolGroup {
  collectCount: number | null;
  positions: number[] | null;
  positions2d: number[][];
  positionsWin: number[] | null;
  previousPositions: number[] | null;
  previousSymbolId: number | null;
  spreadModules: number[] | null;
  subType: string | null;
  symbolId: number | null;
  totalWin: number | null;
  totalwinDouble: number | null;
  type: string | null;
  // @GenericInfo(Array)
  // @GenericInfo(Number)
  // positions2d: number[][];
  // @GenericInfo(Number)
  // positions: number[];
  // @GenericInfo(Number)
  // positionsWin: number[];
  // @GenericInfo(Number)
  // previousPositions: number[];
  totalJackPotWin: number;
  // symbolId: number;
  // previousSymbolId: number;
  // type: string;
  // subType: string;
  // collectCount: number;
  get firstPosition(): number {
    return (this.positions as number[])[0];
  }
  // @GenericInfo(String)
  affectedModules: string[] | null;
}

export class ReelState {
  additionalData: any;
  viewReels: number[][];
  winLines: Line[];
  freeSpinGameCompletionData: FreeSpinGameCompletionDataResponse[] | null;
  winPositions: ReelWinPosition[];
  specialSymbolGroups: SpecialSymbolGroup[] | null;
  substituteReelViews: SubstituteReelViews[];
  totalWin: number;
  totalLost: number;
  progressWin: number;
  spinningReelId: string;
}

export class XtremeBetInfo {
  bets: InternalBet[];
  minBalanceRequired: number;
}

export class StaticModulesShopInfo {
  crystals: number;
  selected: number;
  modules: StaticModule[];
  nextModules: StaticModule[];
  actResult: StaticResult[];
}

export class StaticResult {
  name: string;
  dValue: number;
  bet: number;
  type: number;
  value: number;
}

export class StaticModule {
  buttons: StaticButton[];
  attributes: Record<string, number>;
  status: number;
  name: string;
  level: number;
}

export class StaticButton {
  status: number;
  index: number;
  cost: number;
  type: number;
  value: number;
}
