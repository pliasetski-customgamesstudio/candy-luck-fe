export class SpotGroupDTO {
  coins: number | null;
  subType: string | null;
  token: number | null;
  type: string | null;

  constructor({
    coins,
    subType,
    token,
    type,
  }: {
    coins: number | null;
    subType: string | null;
    token: number | null;
    type: string | null;
  }) {
    this.coins = coins;
    this.subType = subType;
    this.token = token;
    this.type = type;
  }

  static fromJson(json: { [key: string]: any }): SpotGroupDTO {
    return new SpotGroupDTO({
      coins: json['coins'] ?? null,
      subType: json['subType'] ?? null,
      token: json['token'] ?? null,
      type: json['type'] ?? null,
    });
  }
}
