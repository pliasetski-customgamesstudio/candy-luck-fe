export class WordsSpinInfoResponse {
  rankOfNewBag: number | null;

  constructor(rankOfNewBag: number | null) {
    this.rankOfNewBag = rankOfNewBag;
  }

  static fromJson(json: any): WordsSpinInfoResponse {
    return new WordsSpinInfoResponse(json['rankOfNewBag'] ?? null);
  }
}
