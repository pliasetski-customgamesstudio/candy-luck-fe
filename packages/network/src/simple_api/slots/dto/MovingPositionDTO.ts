export class MovingPositionDTO {
  posFrom: number | null;
  posTo: number | null;
  type: string | null;
  value: number | null;

  constructor({
    posFrom,
    posTo,
    type,
    value,
  }: {
    posFrom: number | null;
    posTo: number | null;
    type: string | null;
    value: number | null;
  }) {
    this.posFrom = posFrom;
    this.posTo = posTo;
    this.type = type;
    this.value = value;
  }

  static fromJson(json: { [key: string]: any }): MovingPositionDTO {
    return new MovingPositionDTO({
      posFrom: json['posFrom'] ?? null,
      posTo: json['posTo'] ?? null,
      type: json['type'] ?? null,
      value: json['value'] ?? null,
    });
  }
}
