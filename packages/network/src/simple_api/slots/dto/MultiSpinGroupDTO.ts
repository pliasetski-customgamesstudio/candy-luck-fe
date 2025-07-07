import { MultiSpinRoundDTO } from './MultiSpinRoundDTO';
import { DraculaSpecGroupDTO } from './DraculaSpecGroupDTO';

export class MultiSpinGroupDTO {
  firstWin: number | null;
  groups: MultiSpinRoundDTO[] | null;
  jackPotsSpecGroup: DraculaSpecGroupDTO | null;

  constructor(data: {
    firstWin: number | null;
    groups: MultiSpinRoundDTO[] | null;
    jackPotsSpecGroup: DraculaSpecGroupDTO | null;
  }) {
    this.firstWin = data.firstWin;
    this.groups = data.groups;
    this.jackPotsSpecGroup = data.jackPotsSpecGroup;
  }

  static fromJson(json: Record<string, any>): MultiSpinGroupDTO {
    return new MultiSpinGroupDTO({
      firstWin: json.firstWin ?? null,
      groups: json.groups ? json.groups.map((x: any) => MultiSpinRoundDTO.fromJson(x)) : null,
      jackPotsSpecGroup: json.jackPotsSpecGroup
        ? DraculaSpecGroupDTO.fromJson(json.jackPotsSpecGroup)
        : null,
    });
  }
}
