export class TStaticButtonDTO {
  cost: number | null;
  index: number | null;
  status: number | null;
  type: number | null;
  typeName: string | null;
  value: number | null;

  constructor({
    cost,
    index,
    status,
    type,
    typeName,
    value,
  }: {
    cost: number | null;
    index: number | null;
    status: number | null;
    type: number | null;
    typeName: string | null;
    value: number | null;
  }) {
    this.cost = cost;
    this.index = index;
    this.status = status;
    this.type = type;
    this.typeName = typeName;
    this.value = value;
  }

  static fromJson(json: { [key: string]: any }): TStaticButtonDTO {
    return new TStaticButtonDTO({
      cost: json['cost'] ?? null,
      index: json['index'] ?? null,
      status: json['status'] ?? null,
      type: json['type'] ?? null,
      typeName: json['typeName'] ?? null,
      value: json['value'] ?? null,
    });
  }
}
