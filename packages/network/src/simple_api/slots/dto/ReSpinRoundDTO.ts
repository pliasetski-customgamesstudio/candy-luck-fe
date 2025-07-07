import { DefaultSpecGroupDTO } from './DefaultSpecGroupDTO';
import { WinLineDTO } from './WinLineDTO';
import { WinPositionDTO } from './WinPositionDTO';

export class ReSpinRoundDTO {
  defaultSpecGroups: DefaultSpecGroupDTO[] | null;
  fixedPositions: number[] | null;
  multiplier: number | null;
  newReels: number[] | null;
  newViewReels: number[][];
  positions: number[] | null;
  roundWin: number | null;
  symbolId: number | null;
  type: string | null;
  winLines: WinLineDTO[] | null;
  winPositions: WinPositionDTO[] | null;
  winningName: string | null;

  constructor({
    defaultSpecGroups,
    fixedPositions,
    multiplier,
    newReels,
    newViewReels,
    positions,
    roundWin,
    symbolId,
    type,
    winLines,
    winPositions,
    winningName,
  }: {
    defaultSpecGroups: DefaultSpecGroupDTO[] | null;
    fixedPositions: number[] | null;
    multiplier: number | null;
    newReels: number[] | null;
    newViewReels: number[][];
    positions: number[] | null;
    roundWin: number | null;
    symbolId: number | null;
    type: string | null;
    winLines: WinLineDTO[] | null;
    winPositions: WinPositionDTO[] | null;
    winningName: string | null;
  }) {
    this.defaultSpecGroups = defaultSpecGroups;
    this.fixedPositions = fixedPositions;
    this.multiplier = multiplier;
    this.newReels = newReels;
    this.newViewReels = newViewReels;
    this.positions = positions;
    this.roundWin = roundWin;
    this.symbolId = symbolId;
    this.type = type;
    this.winLines = winLines;
    this.winPositions = winPositions;
    this.winningName = winningName;
  }

  static fromJson(json: Record<string, any>): ReSpinRoundDTO {
    return new ReSpinRoundDTO({
      defaultSpecGroups: json.defaultSpecGroups
        ? json.defaultSpecGroups.map((x: any) => DefaultSpecGroupDTO.fromJson(x))
        : null,
      fixedPositions: json.fixedPositions ? json.fixedPositions : null,
      multiplier: json.multiplier ?? null,
      newReels: json.newReels ? json.newReels : null,
      newViewReels: json.newViewReels
        ? json.newViewReels.map((x: any) => x.map((x: any) => x))
        : null,
      positions: json.positions ? json.positions : null,
      roundWin: json.roundWin ?? null,
      symbolId: json.symbolId ?? null,
      type: json.type ?? null,
      winLines: json.winLines ? json.winLines.map((x: any) => WinLineDTO.fromJson(x)) : null,
      winPositions: json.winPositions
        ? json.winPositions.map((x: any) => WinPositionDTO.fromJson(x))
        : null,
      winningName: json.winningName ?? null,
    });
  }
}
