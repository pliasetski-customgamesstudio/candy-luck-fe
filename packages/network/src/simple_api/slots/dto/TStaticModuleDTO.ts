import { TStaticButtonDTO } from './TStaticButtonDTO';

export class TStaticModuleDTO {
  attributes: Map<string, number> | null;
  buttons: TStaticButtonDTO[] | null;
  level: number | null;
  name: string | null;
  status: number | null;

  constructor(
    attributes: Map<string, number> | null,
    buttons: TStaticButtonDTO[] | null,
    level: number | null,
    name: string | null,
    status: number
  ) {
    this.attributes = attributes;
    this.buttons = buttons;
    this.level = level;
    this.name = name;
    this.status = status;
  }

  static fromJson(json: Record<string, any>): TStaticModuleDTO {
    return new TStaticModuleDTO(
      json['attributes']
        ? new Map(Object.entries(json['attributes']).map(([k, v]) => [k, Number(v)]))
        : null,
      json['buttons'] ? json['buttons'].map((x: any) => TStaticButtonDTO.fromJson(x)) : null,
      json['level'] ?? null,
      json['name'] ?? null,
      json['status'] ?? null
    );
  }
}
