export class FreeSpinGameCompletionDataDTO {
  freeSpinCounter: number | null;
  freeSpinName: string | null;
  totalWin: number | null;
  values: Map<string, any> | null;

  constructor(data: {
    freeSpinCounter: number | null;
    freeSpinName: string | null;
    totalWin: number | null;
    values: Map<string, any> | null;
  }) {
    this.freeSpinCounter = data.freeSpinCounter;
    this.freeSpinName = data.freeSpinName;
    this.totalWin = data.totalWin;
    this.values = data.values;
  }

  static fromJson(json: any): FreeSpinGameCompletionDataDTO {
    return new FreeSpinGameCompletionDataDTO({
      freeSpinCounter: json.freeSpinCounter ?? null,
      freeSpinName: json.freeSpinName ?? null,
      totalWin: json.totalWin ?? null,
      values: json.values ? new Map<string, any>(Object.entries(json.values)) : null,
    });
  }
}
