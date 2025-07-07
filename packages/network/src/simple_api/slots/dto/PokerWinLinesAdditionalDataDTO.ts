import { PokerWinLineDTO } from './PokerWinLineDTO';

export class PokerWinLinesAdditionalDataDTO {
  pokerWinLines: PokerWinLineDTO[] | null;

  constructor(pokerWinLines: PokerWinLineDTO[] | null) {
    this.pokerWinLines = pokerWinLines;
  }

  static fromJson(json: Record<string, any>): PokerWinLinesAdditionalDataDTO {
    return new PokerWinLinesAdditionalDataDTO(
      json['pokerWinLines']
        ? json['pokerWinLines'].map((x: any) => PokerWinLineDTO.fromJson(x))
        : null
    );
  }
}
