export class TStaticResultDTO {
  bet: number | null;
  dValue: number | null;
  name: string | null;
  type: number | null;
  value: number | null;

  constructor({
    bet,
    dValue,
    name,
    type,
    value,
  }: {
    bet: number | null;
    dValue: number | null;
    name: string | null;
    type: number | null;
    value: number | null;
  }) {
    this.bet = bet;
    this.dValue = dValue;
    this.name = name;
    this.type = type;
    this.value = value;
  }

  static fromJson(json: { [key: string]: any }): TStaticResultDTO {
    return new TStaticResultDTO({
      bet: json['bet'] ?? null,
      dValue: json['dValue'] ?? null,
      name: json['name'] ?? null,
      type: json['type'] ?? null,
      value: json['value'] ?? null,
    });
  }
}
