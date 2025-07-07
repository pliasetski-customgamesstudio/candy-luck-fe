import { CollapsingRoundDTO } from './CollapsingRoundDTO';

export class CollapsingSpecGroupDTO {
  groups: CollapsingRoundDTO[] | null;

  constructor(groups: CollapsingRoundDTO[] | null) {
    this.groups = groups;
  }

  static fromJson(json: Record<string, any>): CollapsingSpecGroupDTO {
    return new CollapsingSpecGroupDTO(
      json['groups'] ? json['groups'].map((x: any) => CollapsingRoundDTO.fromJson(x)) : null
    );
  }
}
