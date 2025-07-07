export class ExtraGainsDTO {
  chance: number | null;
  type: string | null;
  value: number | null;

  constructor(data: { chance: number | null; type: string | null; value: number | null }) {
    this.chance = data.chance || 0;
    this.type = data.type || '';
    this.value = data.value || 0;
  }

  static fromJson(json: { [key: string]: any }): ExtraGainsDTO {
    return new ExtraGainsDTO({
      chance: json['chance'] ?? null,
      type: json['type'] ?? null,
      value: json['value'] ?? null,
    });
  }
}
