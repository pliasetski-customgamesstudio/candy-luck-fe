export class WinPositionDTO {
  positions: number[] | null;
  symbol: number | null;
  type: string | null;
  value: number | null;
  winDouble: number | null;

  constructor({
    positions = [],
    symbol,
    type,
    value,
    winDouble,
  }: {
    positions: number[] | null;
    symbol: number | null;
    type: string | null;
    value: number | null;
    winDouble: number | null;
  }) {
    this.positions = positions;
    this.symbol = symbol;
    this.type = type;
    this.value = value;
    this.winDouble = winDouble;
  }

  static fromJson(json: { [key: string]: any }): WinPositionDTO {
    return new WinPositionDTO({
      positions: json['positions'] ? json['positions'] : null,
      symbol: json['symbol'] ?? null,
      type: json['type'] ?? null,
      value: json['value'] ?? null,
      winDouble: json['winDouble'] ?? null,
    });
  }
}
