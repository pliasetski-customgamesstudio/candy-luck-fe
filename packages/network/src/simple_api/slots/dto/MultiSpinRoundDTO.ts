import { DefaultSpecGroupDTO } from './DefaultSpecGroupDTO';
import { WinLineDTO } from './WinLineDTO';
import { WinPositionDTO } from './WinPositionDTO';

export class MultiSpinRoundDTO {
  defaultSpecGroups: DefaultSpecGroupDTO[] | null;
  newViewReels: number[][] | null;
  totalWin: number | null;
  winLines: WinLineDTO[] | null;
  winPositions: WinPositionDTO[] | null;

  constructor({
    defaultSpecGroups,
    newViewReels,
    totalWin,
    winLines,
    winPositions,
  }: {
    defaultSpecGroups: DefaultSpecGroupDTO[] | null;
    newViewReels: number[][];
    totalWin: number | null;
    winLines: WinLineDTO[] | null;
    winPositions: WinPositionDTO[] | null;
  }) {
    this.defaultSpecGroups = defaultSpecGroups;
    this.newViewReels = newViewReels;
    this.totalWin = totalWin;
    this.winLines = winLines;
    this.winPositions = winPositions;
  }

  static fromJson(json: { [key: string]: any }): MultiSpinRoundDTO {
    return new MultiSpinRoundDTO({
      defaultSpecGroups: json['defaultSpecGroups']
        ? json['defaultSpecGroups'].map((x: any) => DefaultSpecGroupDTO.fromJson(x))
        : null,
      newViewReels: json['newViewReels']
        ? json['newViewReels'].map((x: any) => Array.from(x))
        : null,
      totalWin: json['totalWin'] ?? null,
      winLines: json['winLines'] ? json['winLines'].map((x: any) => WinLineDTO.fromJson(x)) : null,
      winPositions: json['winPositions']
        ? json['winPositions'].map((x: any) => WinPositionDTO.fromJson(x))
        : null,
    });
  }
}
