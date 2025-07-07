import { ExtraGainsDTO } from './ExtraGainsDTO';

export class BonusButtonDTO {
  animationStep: number;
  extraValues: ExtraGainsDTO[];
  index: number;
  routingIndex: number;
  totalValue: number;
  type: string;
  value: number;
  view: string;

  constructor(
    animationStep: number,
    extraValues: ExtraGainsDTO[],
    index: number,
    routingIndex: number,
    totalValue: number,
    type: string,
    value: number,
    view: string
  ) {
    this.animationStep = animationStep;
    this.extraValues = extraValues;
    this.index = index;
    this.routingIndex = routingIndex;
    this.totalValue = totalValue;
    this.type = type;
    this.value = value;
    this.view = view;
  }

  static fromJson(json: Record<string, any>): BonusButtonDTO {
    return new BonusButtonDTO(
      json.animationStep,
      Array.isArray(json.extraValues)
        ? json.extraValues.map((x: any) => ExtraGainsDTO.fromJson(x))
        : [],
      json.index,
      json.routingIndex,
      json.totalValue,
      json.type,
      json.value,
      json.view
    );
  }
}
