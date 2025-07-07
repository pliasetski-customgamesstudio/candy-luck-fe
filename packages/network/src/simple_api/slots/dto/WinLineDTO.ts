export class WinLineDTO {
  lineDescription: number[] | null;
  lineNumber: number | null;
  lineSymbols: number[] | null;
  multiplier: number | null;
  positions: number[] | null;
  realCount: number | null;
  symbol: number | null;
  win: number | null;

  constructor(
    lineDescription: number[] | null,
    lineNumber: number | null,
    lineSymbols: number[] | null,
    multiplier: number | null,
    positions: number[] | null,
    realCount: number | null,
    symbol: number | null,
    win: number | null
  ) {
    this.lineDescription = lineDescription || [];
    this.lineNumber = lineNumber;
    this.lineSymbols = lineSymbols || [];
    this.multiplier = multiplier;
    this.positions = positions || [];
    this.realCount = realCount;
    this.symbol = symbol;
    this.win = win;
  }

  static fromJson(json: Record<string, any>): WinLineDTO {
    return new WinLineDTO(
      json['lineDescription'] ? Array.from(json['lineDescription']) : null,
      json['lineNumber'] ?? null,
      json['lineSymbols'] ? Array.from(json['lineSymbols']) : null,
      json['multiplier'] ?? null,
      json['positions'] ? Array.from(json['positions']) : null,
      json['realCount'] ?? null,
      json['symbol'] ?? null,
      json['win'] ?? null
    );
  }
}
