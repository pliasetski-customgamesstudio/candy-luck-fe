export class PokerWinLineDTO {
  combinationName: string | null;
  lineDescription: number[] | null;
  lineNumber: number | null;
  lineSymbols: number[] | null;
  multiplier: number | null;
  positions: number[] | null;
  realCount: number | null;
  symbol: number | null;
  win: number | null;

  constructor({
    combinationName,
    lineDescription,
    lineNumber,
    lineSymbols,
    multiplier,
    positions,
    realCount,
    symbol,
    win,
  }: {
    combinationName: string | null;
    lineDescription: number[] | null;
    lineNumber: number | null;
    lineSymbols: number[] | null;
    multiplier: number | null;
    positions: number[] | null;
    realCount: number | null;
    symbol: number | null;
    win: number | null;
  }) {
    this.combinationName = combinationName;
    this.lineDescription = lineDescription;
    this.lineNumber = lineNumber;
    this.lineSymbols = lineSymbols;
    this.multiplier = multiplier;
    this.positions = positions;
    this.realCount = realCount;
    this.symbol = symbol;
    this.win = win;
  }

  static fromJson(json: Record<string, any>): PokerWinLineDTO {
    return new PokerWinLineDTO({
      combinationName: json['combinationName'] ?? null,
      lineDescription: json['lineDescription']
        ? json['lineDescription'].map((x: number) => x)
        : null,
      lineNumber: json['lineNumber'] ?? null,
      lineSymbols: json['lineSymbols'] ? json['lineSymbols'].map((x: number) => x) : null,
      multiplier: json['multiplier'] ?? null,
      positions: json['positions'] ? json['positions'].map((x: number) => x) : null,
      realCount: json['realCount'] ?? null,
      symbol: json['symbol'] ?? null,
      win: json['win'] ?? null,
    });
  }
}
