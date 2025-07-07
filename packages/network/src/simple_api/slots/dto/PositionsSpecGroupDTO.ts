export class PositionsSpecGroupDTO {
  positions: number[] | null;
  symbolId: number | null;
  type: string | null;

  constructor({
    positions,
    symbolId,
    type,
  }: {
    positions: number[] | null;
    symbolId: number | null;
    type: string | null;
  }) {
    this.positions = positions;
    this.symbolId = symbolId;
    this.type = type;
  }

  static fromJson(json: Record<string, any>): PositionsSpecGroupDTO {
    return new PositionsSpecGroupDTO({
      positions: json['positions'] ? json['positions'].map((x: any) => x) : null,
      symbolId: json['symbolId'] ?? null,
      type: json['type'] ?? null,
    });
  }
}
