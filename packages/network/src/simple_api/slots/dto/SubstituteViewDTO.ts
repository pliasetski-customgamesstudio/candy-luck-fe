export class SubstituteViewDTO {
  chances: number[] | null;
  reelId: number | null;
  symbols: number[] | null;

  constructor(data: { chances: number[] | null; reelId: number | null; symbols: number[] | null }) {
    this.chances = data.chances || [];
    this.reelId = data.reelId || 0;
    this.symbols = data.symbols || [];
  }

  static fromJson(json: { [key: string]: any }): SubstituteViewDTO {
    return new SubstituteViewDTO({
      chances: json.chances ? Array.from(json.chances) : null,
      reelId: json.reelId ?? null,
      symbols: json.symbols ? Array.from(json.symbols) : null,
    });
  }
}
