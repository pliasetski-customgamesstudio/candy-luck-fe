import { BonusInfoDTO } from './BonusInfoDTO';
import { DefaultSpecGroupDTO } from './DefaultSpecGroupDTO';
import { FreeSpinGameCompletionDataDTO } from './FreeSpinGameCompletionDataDTO';
import { FreeSpinsInfoDTO } from './FreeSpinsInfoDTO';
import { SubstituteViewDTO } from './SubstituteViewDTO';
import { TStaticGamesInfoDTO } from './TStaticGamesInfoDTO';
import { WinLineDTO } from './WinLineDTO';
import { WinPositionDTO } from './WinPositionDTO';

export class MachineStateResponse {
  additionalData: any | null;
  additionalType: string | null;
  bonusInfo: BonusInfoDTO | null;
  defaultSpecGroups: DefaultSpecGroupDTO[] | null;
  endedFeatures: string[] | null;
  freeSpinGameCompletionData: FreeSpinGameCompletionDataDTO[] | null;
  freeSpinsInfo: FreeSpinsInfoDTO | null;
  kosProgress: number | null;
  lastReels: number[][] | null;
  machineId: number | null;
  scatterInfo: BonusInfoDTO | null;
  spinId: number | null;
  spinningReelId: string | null;
  substituteViews: SubstituteViewDTO[] | null;
  totalLost: number | null;
  totalWin: number | null;
  progressWin: number | null;
  tstaticGamesInfo: TStaticGamesInfoDTO | null;
  viewReels: number[][] | null;
  volatility: number | null;
  winLines: WinLineDTO[] | null;
  winPositions: WinPositionDTO[] | null;
  winningName: string | null;

  constructor({
    additionalData,
    additionalType,
    bonusInfo,
    defaultSpecGroups,
    endedFeatures,
    freeSpinGameCompletionData,
    freeSpinsInfo,
    kosProgress,
    lastReels,
    machineId,
    scatterInfo,
    spinId,
    spinningReelId,
    substituteViews,
    totalLost,
    totalWin,
    progressWin,
    tstaticGamesInfo,
    viewReels,
    volatility,
    winLines,
    winPositions,
    winningName,
  }: {
    additionalData: any | null;
    additionalType: string | null;
    bonusInfo: BonusInfoDTO | null;
    defaultSpecGroups: DefaultSpecGroupDTO[] | null;
    endedFeatures: string[] | null;
    freeSpinGameCompletionData: FreeSpinGameCompletionDataDTO[] | null;
    freeSpinsInfo: FreeSpinsInfoDTO | null;
    kosProgress: number | null;
    lastReels: number[][] | null;
    machineId: number | null;
    scatterInfo: BonusInfoDTO | null;
    spinId: number | null;
    spinningReelId: string | null;
    substituteViews: SubstituteViewDTO[] | null;
    totalLost: number | null;
    totalWin: number | null;
    progressWin: number | null;
    tstaticGamesInfo: TStaticGamesInfoDTO | null;
    viewReels: number[][] | null;
    volatility: number | null;
    winLines: WinLineDTO[] | null;
    winPositions: WinPositionDTO[] | null;
    winningName: string | null;
  }) {
    this.additionalData = additionalData;
    this.additionalType = additionalType;
    this.bonusInfo = bonusInfo;
    this.defaultSpecGroups = defaultSpecGroups;
    this.endedFeatures = endedFeatures;
    this.freeSpinGameCompletionData = freeSpinGameCompletionData;
    this.freeSpinsInfo = freeSpinsInfo;
    this.kosProgress = kosProgress;
    this.lastReels = lastReels;
    this.machineId = machineId;
    this.scatterInfo = scatterInfo;
    this.spinId = spinId;
    this.spinningReelId = spinningReelId;
    this.substituteViews = substituteViews;
    this.totalLost = totalLost;
    this.totalWin = totalWin;
    this.progressWin = progressWin;
    this.tstaticGamesInfo = tstaticGamesInfo;
    this.viewReels = viewReels;
    this.volatility = volatility;
    this.winLines = winLines;
    this.winPositions = winPositions;
    this.winningName = winningName;
  }

  public static fromJson(json: Record<string, any>): MachineStateResponse {
    return new MachineStateResponse({
      additionalData: json.additionalData ?? null,
      additionalType: json.additionalType ?? null,
      bonusInfo: json.bonusInfo ? BonusInfoDTO.fromJson(json.bonusInfo) : null,
      defaultSpecGroups: json.defaultSpecGroups
        ? json.defaultSpecGroups.map((x: any) => DefaultSpecGroupDTO.fromJson(x))
        : null,
      endedFeatures: json.endedFeatures ? json.endedFeatures : null,
      freeSpinGameCompletionData: json.freeSpinGameCompletionData
        ? json.freeSpinGameCompletionData.map((x: any) => FreeSpinGameCompletionDataDTO.fromJson(x))
        : null,
      freeSpinsInfo: json.freeSpinsInfo ? FreeSpinsInfoDTO.fromJson(json.freeSpinsInfo) : null,
      kosProgress: json.kosProgress ?? null,
      lastReels: json.lastReels ? json.lastReels.map((x: any) => Array.from(x)) : null,
      machineId: json.machineId ?? null,
      scatterInfo: json.scatterInfo ? BonusInfoDTO.fromJson(json.scatterInfo) : null,
      spinId: json.spinId ?? null,
      spinningReelId: json.spinningReelId ?? null,
      substituteViews: json.substituteViews
        ? json.substituteViews.map((x: any) => SubstituteViewDTO.fromJson(x))
        : null,
      totalLost: json.totalLost ?? null,
      totalWin: json.totalWin ?? null,
      progressWin: json.progressWin ?? null,
      tstaticGamesInfo: json.tstaticGamesInfo
        ? TStaticGamesInfoDTO.fromJson(json.tstaticGamesInfo)
        : null,
      viewReels: json.viewReels ? json.viewReels.map((x: any) => Array.from(x)) : null,
      volatility: json.volatility ?? null,
      winLines: json.winLines ? json.winLines.map((x: any) => WinLineDTO.fromJson(x)) : null,
      winPositions: json.winPositions
        ? json.winPositions.map((x: any) => WinPositionDTO.fromJson(x))
        : null,
      winningName: json.winningName ?? null,
    });
  }
}
