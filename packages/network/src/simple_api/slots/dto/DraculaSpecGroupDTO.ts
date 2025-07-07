export class DraculaSpecGroupDTO {
  dJackPotInitialValues: number[] | null;
  dJackPotValues: number[] | null;
  jackPotInitialValues: number[] | null;
  jackPotValues: number[] | null;
  type: string | null;

  constructor({
    dJackPotInitialValues,
    dJackPotValues,
    jackPotInitialValues,
    jackPotValues,
    type,
  }: {
    dJackPotInitialValues: number[] | null;
    dJackPotValues: number[] | null;
    jackPotInitialValues: number[] | null;
    jackPotValues: number[] | null;
    type: string | null;
  }) {
    this.dJackPotInitialValues = dJackPotInitialValues;
    this.dJackPotValues = dJackPotValues;
    this.jackPotInitialValues = jackPotInitialValues;
    this.jackPotValues = jackPotValues;
    this.type = type;
  }

  static fromJson(json: { [key: string]: any }): DraculaSpecGroupDTO {
    return new DraculaSpecGroupDTO({
      dJackPotInitialValues: json['dJackPotInitialValues']
        ? json['dJackPotInitialValues'].map((x: any) => parseFloat(x))
        : null,
      dJackPotValues: json['dJackPotValues']
        ? json['dJackPotValues'].map((x: any) => parseFloat(x))
        : null,
      jackPotInitialValues: json['jackPotInitialValues']
        ? json['jackPotInitialValues'].map((x: any) => parseFloat(x))
        : null,
      jackPotValues: json['jackPotValues']
        ? json['jackPotValues'].map((x: any) => parseFloat(x))
        : null,
      type: json['type'] ?? null,
    });
  }
}
