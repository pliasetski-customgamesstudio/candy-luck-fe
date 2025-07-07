export class UserJackpotStateDto {
  coinsWin: number | null;
  entryPoints: number | null;
  hasEntered: boolean | null;
  jackpotId: string | null;
  lines: number | null;
  points: number | null;
  usdWin: number | null;
  winner: boolean | null;

  constructor({
    coinsWin,
    entryPoints,
    hasEntered,
    jackpotId,
    lines,
    points,
    usdWin,
    winner,
  }: {
    coinsWin: number | null;
    entryPoints: number | null;
    hasEntered: boolean | null;
    jackpotId: string | null;
    lines: number | null;
    points: number | null;
    usdWin: number | null;
    winner: boolean | null;
  }) {
    this.coinsWin = coinsWin;
    this.entryPoints = entryPoints;
    this.hasEntered = hasEntered;
    this.jackpotId = jackpotId;
    this.lines = lines;
    this.points = points;
    this.usdWin = usdWin;
    this.winner = winner;
  }

  static fromJson(json: { [key: string]: any }): UserJackpotStateDto {
    return new UserJackpotStateDto({
      coinsWin: json['coinsWin'] ?? null,
      entryPoints: json['entryPoints'] ?? null,
      hasEntered: json['hasEntered'] ?? null,
      jackpotId: json['jackpotId'] ?? null,
      lines: json['lines'] ?? null,
      points: json['points'] ?? null,
      usdWin: json['usdWin'] ?? null,
      winner: json['winner'] ?? null,
    });
  }
}
