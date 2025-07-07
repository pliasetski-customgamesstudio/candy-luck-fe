import { DefaultSpecGroupDTO } from './DefaultSpecGroupDTO';
import { WinLineDTO } from './WinLineDTO';

export class CollapsingRoundDTO {
  defaultSpecGroups: DefaultSpecGroupDTO[] | null;
  multiplier: number | null;
  newReels: number[] | null;
  positions: number[] | null;
  roundWin: number | null;
  symbolId: number | null;
  type: string | null;
  winLines: WinLineDTO[] | null;

  constructor({
    defaultSpecGroups,
    multiplier,
    newReels,
    positions,
    roundWin,
    symbolId,
    type,
    winLines,
  }: {
    defaultSpecGroups: DefaultSpecGroupDTO[] | null;
    multiplier: number | null;
    newReels: number[] | null;
    positions: number[] | null;
    roundWin: number | null;
    symbolId: number | null;
    type: string | null;
    winLines: WinLineDTO[] | null;
  }) {
    this.defaultSpecGroups = defaultSpecGroups;
    this.multiplier = multiplier;
    this.newReels = newReels;
    this.positions = positions;
    this.roundWin = roundWin;
    this.symbolId = symbolId;
    this.type = type;
    this.winLines = winLines;
  }

  static fromJson(json: Record<string, any>): CollapsingRoundDTO {
    return new CollapsingRoundDTO({
      defaultSpecGroups: json['defaultSpecGroups']
        ? json['defaultSpecGroups'].map((x: any) => DefaultSpecGroupDTO.fromJson(x))
        : null,
      multiplier: json['multiplier'] ?? null,
      newReels: json['newReels'] ? json['newReels'].map((x: any) => x) : null,
      positions: json['positions'] ? json['positions'].map((x: any) => x) : null,
      roundWin: json['roundWin'] ?? null,
      symbolId: json['symbolId'] ?? null,
      type: json['type'] ?? null,
      winLines: json['winLines'] ? json['winLines'].map((x: any) => WinLineDTO.fromJson(x)) : null,
    });
  }
}
