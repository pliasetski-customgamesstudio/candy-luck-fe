export class DefaultSpecGroupDTO {
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

  constructor({
    collectCount,
    positions,
    positions2d,
    positionsWin,
    previousPositions,
    previousSymbolId,
    spreadModules,
    subType,
    symbolId,
    totalWin,
    totalwinDouble,
    type,
  }: {
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
  }) {
    this.collectCount = collectCount;
    this.positions = positions;
    this.positions2d = positions2d;
    this.positionsWin = positionsWin;
    this.previousPositions = previousPositions;
    this.previousSymbolId = previousSymbolId;
    this.spreadModules = spreadModules;
    this.subType = subType;
    this.symbolId = symbolId;
    this.totalWin = totalWin;
    this.totalwinDouble = totalwinDouble;
    this.type = type;
  }

  static fromJson(json: { [key: string]: any }): DefaultSpecGroupDTO {
    return new DefaultSpecGroupDTO({
      collectCount: json['collectCount'] ?? null,
      positions: json['positions'] ? json['positions'] : null,
      positions2d: json['positions2d'] ? json['positions2d'].map((x: number[]) => x) : null,
      positionsWin: json['positionsWin'] ? json['positionsWin'] : null,
      previousPositions: json['previousPositions'] ? json['previousPositions'] : null,
      previousSymbolId: json['previousSymbolId'] ?? null,
      spreadModules: json['spreadModules'] ? json['spreadModules'] : null,
      subType: json['subType'] ?? null,
      symbolId: json['symbolId'] ?? null,
      totalWin: json['totalWin'] ?? null,
      totalwinDouble: json['totalwinDouble'] ?? null,
      type: json['type'] ?? null,
    });
  }
}
