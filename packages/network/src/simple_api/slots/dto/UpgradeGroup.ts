export class UpgradeGroup {
  id: number | null;
  include: UpgradeGroup[] | null;
  subType: string | null;
  type: string | null;
  value: number | null;
  value2: number | null;

  constructor({
    id,
    include,
    subType,
    type,
    value,
    value2,
  }: {
    id: number | null;
    include: UpgradeGroup[] | null;
    subType: string | null;
    type: string | null;
    value: number | null;
    value2: number | null;
  }) {
    this.id = id;
    this.include = include;
    this.subType = subType;
    this.type = type;
    this.value = value;
    this.value2 = value2;
  }

  static fromJson(json: { [key: string]: any }): UpgradeGroup {
    return new UpgradeGroup({
      id: json['id'] ?? null,
      include: json['include'] ? json['include'].map((x: any) => UpgradeGroup.fromJson(x)) : null,
      subType: json['subType'] ?? null,
      type: json['type'] ?? null,
      value: json['value'] ?? null,
      value2: json['value2'] ?? null,
    });
  }
}
