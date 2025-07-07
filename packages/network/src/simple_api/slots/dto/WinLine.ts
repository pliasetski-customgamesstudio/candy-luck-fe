export class WinLine {
  lineNumber: number | null;
  multiplier: number | null;
  positions: number[] | null;
  symbol: number | null;
  win: number | null;

  constructor({
    lineNumber,
    multiplier,
    positions,
    symbol,
    win,
  }: {
    lineNumber: number | null;
    multiplier: number | null;
    positions: number[] | null;
    symbol: number | null;
    win: number | null;
  }) {
    this.lineNumber = lineNumber;
    this.multiplier = multiplier;
    this.positions = positions;
    this.symbol = symbol;
    this.win = win;
  }

  static fromJson(json: { [key: string]: any }): WinLine {
    return new WinLine({
      lineNumber: json['lineNumber'] ?? null,
      multiplier: json['multiplier'] ?? null,
      positions: json['positions'] ? Array.from(json['positions']) : null,
      symbol: json['symbol'] ?? null,
      win: json['win'] ?? null,
    });
  }
}
