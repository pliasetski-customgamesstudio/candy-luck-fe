import { ExtraGainsDTO } from './ExtraGainsDTO';

export class RoundPaytableItemDTO {
  extraValues: ExtraGainsDTO[] | null;
  index: number | null;
  totalValue: number | null;
  type: string | null;
  value: number | null;

  constructor(
    extraValues: ExtraGainsDTO[] | null,
    index: number | null,
    totalValue: number | null,
    type: string | null,
    value: number
  ) {
    this.extraValues = extraValues;
    this.index = index;
    this.totalValue = totalValue;
    this.type = type;
    this.value = value;
  }

  static fromJson(json: { [key: string]: any }): RoundPaytableItemDTO {
    return new RoundPaytableItemDTO(
      json['extraValues'] ? json['extraValues'].map((x: any) => ExtraGainsDTO.fromJson(x)) : null,
      json['index'] ?? null,
      json['totalValue'] ?? null,
      json['type'] ?? null,
      json['value'] ?? null
    );
  }
}
