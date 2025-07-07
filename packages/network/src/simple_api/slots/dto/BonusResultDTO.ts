import { DefaultSpecGroupDTO } from './DefaultSpecGroupDTO';
import { WinLine } from './WinLine';

export class BonusResultDTO {
  additionWin: number | null;
  bet: number | null;
  bonusWin: number | null;
  lines: number | null;
  multiplier: number | null;
  specGroups: DefaultSpecGroupDTO[] | null;
  totalWin: number | null;
  winlines: WinLine[] | null;
  winningName: string | null;
  betCalculation: string | null;

  constructor({
    additionWin,
    bet,
    bonusWin,
    lines,
    multiplier,
    specGroups,
    totalWin,
    winlines,
    winningName,
    betCalculation,
  }: {
    additionWin: number | null;
    bet: number | null;
    bonusWin: number | null;
    lines: number | null;
    multiplier: number | null;
    specGroups: DefaultSpecGroupDTO[] | null;
    totalWin: number | null;
    winlines: WinLine[] | null;
    winningName: string | null;
    betCalculation: string | null;
  }) {
    this.additionWin = additionWin;
    this.bet = bet;
    this.bonusWin = bonusWin;
    this.lines = lines;
    this.multiplier = multiplier;
    this.specGroups = specGroups;
    this.totalWin = totalWin;
    this.winlines = winlines;
    this.winningName = winningName;
    this.betCalculation = betCalculation;
  }

  static fromJson(json: { [key: string]: any }): BonusResultDTO {
    return new BonusResultDTO({
      additionWin: json['additionWin'] ?? null,
      bet: json['bet'] ?? null,
      bonusWin: json['bonusWin'] ?? null,
      lines: json['lines'] ?? null,
      multiplier: json['multiplier'] ?? null,
      specGroups: json['specGroups']
        ? json['specGroups'].map((x: any) => DefaultSpecGroupDTO.fromJson(x))
        : null,
      totalWin: json['totalWin'] ?? null,
      winlines: json['winlines'] ? json['winlines'].map((x: any) => WinLine.fromJson(x)) : null,
      winningName: json['winningName'] ?? null,
      betCalculation: json['betCalculation'] ?? null,
    });
  }
}
