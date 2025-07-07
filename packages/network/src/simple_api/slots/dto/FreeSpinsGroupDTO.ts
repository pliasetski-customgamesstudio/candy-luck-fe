export class FreeSpinsGroupDTO {
  bet: number | null;
  betCalculation: string | null;
  count: number | null;
  lines: number | null;
  name: string | null;
  usedCount: number | null;
  win: number | null;

  constructor(data: {
    bet: number | null;
    betCalculation: string | null;
    count: number | null;
    lines: number | null;
    name: string | null;
    usedCount: number | null;
    win: number | null;
  }) {
    this.bet = data.bet || 0;
    this.betCalculation = data.betCalculation || '';
    this.count = data.count || 0;
    this.lines = data.lines || 0;
    this.name = data.name || '';
    this.usedCount = data.usedCount || 0;
    this.win = data.win || 0;
  }

  static fromJson(json: any): FreeSpinsGroupDTO {
    return new FreeSpinsGroupDTO({
      bet: json['bet'] ?? null,
      betCalculation: json['betCalculation'] ?? null,
      count: json['count'] ?? null,
      lines: json['lines'] ?? null,
      name: json['name'] ?? null,
      usedCount: json['usedCount'] ?? null,
      win: json['win'] ?? null,
    });
  }
}
