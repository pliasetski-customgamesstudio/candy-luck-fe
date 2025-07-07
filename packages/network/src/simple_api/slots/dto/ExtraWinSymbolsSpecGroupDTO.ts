import { WinLineDTO } from './WinLineDTO';

export class ExtraWinSymbolsSpecGroupDTO {
  featureWin: number | null;
  positions: number[] | null;
  symbolId: number | null;
  type: string | null;
  winBeforeFeature: number | null;
  winLines: WinLineDTO[] | null;

  constructor(data: {
    featureWin: number | null;
    positions: number[] | null;
    symbolId: number | null;
    type: string | null;
    winBeforeFeature: number | null;
    winLines: WinLineDTO[] | null;
  }) {
    this.featureWin = data.featureWin || 0;
    this.positions = data.positions || [];
    this.symbolId = data.symbolId || 0;
    this.type = data.type || '';
    this.winBeforeFeature = data.winBeforeFeature || 0;
    this.winLines = data.winLines || [];
  }

  static fromJson(json: Record<string, any>): ExtraWinSymbolsSpecGroupDTO {
    return new ExtraWinSymbolsSpecGroupDTO({
      featureWin: json.featureWin ?? null,
      positions: json.positions ? json.positions.map((x: any) => x) : null,
      symbolId: json.symbolId ?? null,
      type: json.type ?? null,
      winBeforeFeature: json.winBeforeFeature ?? null,
      winLines: json.winLines ? json.winLines.map((x: any) => WinLineDTO.fromJson(x)) : null,
    });
  }
}
