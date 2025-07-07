export class ExtraBetDTO {
  bet: number | null;
  effectiveBet: number | null;

  constructor({ bet, effectiveBet }: { bet: number | null; effectiveBet: number | null }) {
    this.bet = bet;
    this.effectiveBet = effectiveBet;
  }

  static fromJson(json: { [key: string]: any }): ExtraBetDTO {
    return new ExtraBetDTO({
      bet: json['bet'] ?? null,
      effectiveBet: json['effectiveBet'] ?? null,
    });
  }
}
