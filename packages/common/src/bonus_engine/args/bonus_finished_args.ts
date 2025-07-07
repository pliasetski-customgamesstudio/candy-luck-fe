import { IBonusResponse } from '../../network/response';

export class BonusFinishedArgs {
  constructor(
    public response: IBonusResponse | null,
    public lastSelectedValue: number | null,
    public lastSelectedView: string | null,
    public lastSelectedType: string | null,
    public totalWin: number | null,
    public bonusWin: number | null
  ) {}

  static empty(): BonusFinishedArgs {
    return new BonusFinishedArgs(null, null, null, null, null, null);
  }
}
