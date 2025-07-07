import { ReSpinRoundDTO } from './ReSpinRoundDTO';

export class ReSpinGroupDTO {
  firstWin: number | null;
  groups: ReSpinRoundDTO[] | null;

  constructor(firstWin: number | null, groups: ReSpinRoundDTO[] | null) {
    this.firstWin = firstWin;
    this.groups = groups;
  }

  static fromJson(json: Record<string, any>): ReSpinGroupDTO {
    return new ReSpinGroupDTO(
      json['firstWin'] ?? null,
      json['groups'] ? json['groups'].map((x: any) => ReSpinRoundDTO.fromJson(x)) : null
    );
  }
}
