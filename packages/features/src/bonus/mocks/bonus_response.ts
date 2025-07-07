import {
  IBonusResponse,
  IBonusResult,
  IBonusRound,
  IBonusUserParlayInfo,
  InternalFreeSpinsInfo,
  FreeSpinReBuyInfoResponse,
  SpecialSymbolGroup,
  Line,
  IExtraGain,
  IRoundButton,
  IRoundPaytableItem,
} from '@cgs/common';

export class BonusResponse implements IBonusResponse {
  type: string;
  configuredBets: Record<string, Record<string, Record<number, number[]>>> | null;
  bonusType: string;
  result: IBonusResult | null;
  nextRound: IBonusRound;
  currentRound: IBonusRound | null;
  bonusInfo: IBonusResponse;
  scatterInfo: IBonusResponse;
  previousRounds: IBonusRound[];
  bonusFinished: boolean;
  bonusStarted: boolean;
  userParlayInfo: IBonusUserParlayInfo;
  freeSpinsInfo: InternalFreeSpinsInfo;
  freeSpinReBuyInfo: FreeSpinReBuyInfoResponse;
}

export class BonusResult implements IBonusResult {
  bonusWin: number;
  totalWin: number;
  specGroups: SpecialSymbolGroup[] | null;
  additionWin: number;
  multiplier: number;
  bet: number;
  lines: number;
  winName: string;
  betCalculation: string;
  winLines: Line[] | null;
}

export class ExtraGain implements IExtraGain {
  type: string;
  value: number;
}

export class BonusRound implements IBonusRound {
  notSelectedButtons: IRoundButton[];
  selectedButtons: IRoundButton[];
  serverSelectedButtons: IRoundButton[];
  paytable: IRoundPaytableItem[];
  roundType: string;
  roundNumber: number;
  attemps: number;
  attempsUsed: number;
}

export class RoundButton implements IRoundButton {
  type: string;
  value: number;
  totalValue: number;
  view: string;
  index: number;
  extraValues: IExtraGain[];
  routingIndex: number;
}

export class PaytableItem implements IRoundPaytableItem {
  type: string;
  value: number;
  totalValue: number;
  index: number;
  extraValues: IExtraGain[];
}

export class BonusUserParlayInfo implements IBonusUserParlayInfo {
  isUserParlayFinished: boolean;
}
