export class JackPotsSpecGroupDTO {
  dJackPotInitialValues: number[] | null;
  dJackPotValues: number[] | null;
  jackPotInitialValues: number[] | null;
  jackPotValues: number[] | null;
  targetCollectCount: number | null;
  type: string | null;

  constructor({
    dJackPotInitialValues = [],
    dJackPotValues = [],
    jackPotInitialValues = [],
    jackPotValues = [],
    targetCollectCount,
    type,
  }: {
    dJackPotInitialValues: number[] | null;
    dJackPotValues: number[] | null;
    jackPotInitialValues: number[] | null;
    jackPotValues: number[] | null;
    targetCollectCount: number | null;
    type: string | null;
  }) {
    this.dJackPotInitialValues = dJackPotInitialValues;
    this.dJackPotValues = dJackPotValues;
    this.jackPotInitialValues = jackPotInitialValues;
    this.jackPotValues = jackPotValues;
    this.targetCollectCount = targetCollectCount;
    this.type = type;
  }
  static fromJson(json: Record<string, any>): JackPotsSpecGroupDTO {
    return new JackPotsSpecGroupDTO({
      dJackPotInitialValues: json['dJackPotInitialValues']
        ? json['dJackPotInitialValues'].map((x: number) => x)
        : null,
      dJackPotValues: json['dJackPotValues'] ? json['dJackPotValues'].map((x: number) => x) : null,
      jackPotInitialValues: json['jackPotInitialValues']
        ? json['jackPotInitialValues'].map((x: number) => x)
        : null,
      jackPotValues: json['jackPotValues'] ? json['jackPotValues'].map((x: number) => x) : null,
      targetCollectCount: json['targetCollectCount'] ?? null,
      type: json['type'] ?? null,
    });
  }
}
