import { BonusButtonDTO } from './BonusButtonDTO';
import { RoundPaytableItemDTO } from './RoundPaytableItemDTO';

export class BonusRoundDTO {
  attemps: number | null;
  attempsUsed: number | null;
  cheatButtons: BonusButtonDTO[] | null;
  notSelectedButtons: BonusButtonDTO[] | null;
  paytable: RoundPaytableItemDTO[] | null;
  roundNumber: number | null;
  roundType: string | null;
  selectedButtons: BonusButtonDTO[] | null;
  serverSelectedButtons: BonusButtonDTO[] | null;

  constructor({
    attemps,
    attempsUsed,
    cheatButtons,
    notSelectedButtons,
    paytable,
    roundNumber,
    roundType,
    selectedButtons,
    serverSelectedButtons,
  }: {
    attemps: number | null;
    attempsUsed: number | null;
    cheatButtons?: BonusButtonDTO[];
    notSelectedButtons?: BonusButtonDTO[];
    paytable?: RoundPaytableItemDTO[];
    roundNumber: number | null;
    roundType: string | null;
    selectedButtons?: BonusButtonDTO[];
    serverSelectedButtons?: BonusButtonDTO[];
  }) {
    this.attemps = attemps;
    this.attempsUsed = attempsUsed;
    this.cheatButtons = cheatButtons || [];
    this.notSelectedButtons = notSelectedButtons || [];
    this.paytable = paytable || [];
    this.roundNumber = roundNumber;
    this.roundType = roundType;
    this.selectedButtons = selectedButtons || [];
    this.serverSelectedButtons = serverSelectedButtons || [];
  }

  static fromJson(json: any): BonusRoundDTO {
    return new BonusRoundDTO({
      attemps: json['attemps'] ?? null,
      attempsUsed: json['attempsUsed'] ?? null,
      cheatButtons: json['cheatButtons']
        ? json['cheatButtons'].map((x: any) => BonusButtonDTO.fromJson(x))
        : null,
      notSelectedButtons: json['notSelectedButtons']
        ? json['notSelectedButtons'].map((x: any) => BonusButtonDTO.fromJson(x))
        : null,
      paytable: json['paytable']
        ? json['paytable'].map((x: any) => RoundPaytableItemDTO.fromJson(x))
        : null,
      roundNumber: json['roundNumber'] ?? null,
      roundType: json['roundType'],
      selectedButtons: json['selectedButtons']
        ? json['selectedButtons'].map((x: any) => BonusButtonDTO.fromJson(x))
        : null,
      serverSelectedButtons: json['serverSelectedButtons']
        ? json['serverSelectedButtons'].map((x: any) => BonusButtonDTO.fromJson(x))
        : null,
    });
  }
}
