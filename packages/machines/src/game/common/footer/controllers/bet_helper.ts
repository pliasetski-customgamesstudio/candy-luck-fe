import { EPSILON } from '@cgs/syd';
import { SlotSession } from '../../slot_session';

enum BetTypeParam {
  Min = 'min',
  CustomSmall = 'custom small',
  HalfDefault = 'half default',
  Default = 'default',
  CustomBig = 'custom big',
  HalfMax = 'half max',
  Max = 'max',
  ExtraBet = 'extra bet',
}

function BetTypeParamFromString(value: string): BetTypeParam | null {
  switch (value) {
    case BetTypeParam.Min:
      return BetTypeParam.Min;
    case BetTypeParam.CustomSmall:
      return BetTypeParam.CustomSmall;
    case BetTypeParam.HalfDefault:
      return BetTypeParam.HalfDefault;
    case BetTypeParam.Default:
      return BetTypeParam.Default;
    case BetTypeParam.CustomBig:
      return BetTypeParam.CustomBig;
    case BetTypeParam.HalfMax:
      return BetTypeParam.HalfMax;
    case BetTypeParam.Max:
      return BetTypeParam.Max;
    case BetTypeParam.ExtraBet:
      return BetTypeParam.ExtraBet;
    default:
      return null;
  }
}

export class BetHelper {
  private _slotSession: SlotSession;

  constructor(slotSession: SlotSession) {
    this._slotSession = slotSession;
  }

  betQualifies(betType: string, bet: number): boolean {
    const betEnum = BetTypeParamFromString(betType);
    switch (betEnum) {
      case BetTypeParam.Default:
        return bet >= this._slotSession.defaultBet;

      case BetTypeParam.Max:
        return bet >= this._slotSession.getMaxBet().bet;

      case BetTypeParam.Min:
        return bet >= this._slotSession.getMinBet().bet;

      case BetTypeParam.CustomBig:
        return bet > this._slotSession.defaultBet;

      case BetTypeParam.HalfMax:
        return bet >= (this._slotSession.defaultBet + this._slotSession.getMaxBet().bet) / 2.0;

      case BetTypeParam.CustomSmall:
        return bet > this._slotSession.getMinBet().bet;

      case BetTypeParam.HalfDefault:
        return bet >= (this._slotSession.getMinBet().bet + this._slotSession.defaultBet) / 2.0;

      case BetTypeParam.ExtraBet:
        return this._slotSession.currentBet.isExtraBet;
    }
    return false;
  }

  getMinQualifyingBet(betType: string): number {
    const bet = this._slotSession.currentBet.bet;
    const minBet = this._slotSession.getMinBet().bet;
    const maxBet = this._slotSession.getMaxBet().bet;
    const defaultBet = this._slotSession.defaultBet;
    const halfDefaultBet = (minBet + defaultBet) / 2.0;
    const halfMaxBet = (defaultBet + maxBet) / 2.0;

    const betEnum = BetTypeParamFromString(betType);
    switch (betEnum) {
      case BetTypeParam.Default:
        return defaultBet * this._slotSession.currentLine;

      case BetTypeParam.Max:
        return maxBet * this._slotSession.currentLine;

      case BetTypeParam.Min:
        return minBet * this._slotSession.currentLine;

      case BetTypeParam.CustomBig:
        const betAfterDefault = this._slotSession.machineInfo.bets.find(
          (b) => Math.abs(b.bet - defaultBet) > EPSILON
        )!.bet;
        return betAfterDefault * this._slotSession.currentLine;

      case BetTypeParam.HalfMax:
        const betAfterHalfMaxBet = this._slotSession.machineInfo.bets.find(
          (b) => b.bet >= halfMaxBet
        )!.bet;
        return betAfterHalfMaxBet * this._slotSession.currentLine;

      case BetTypeParam.CustomSmall:
        const betAfterMin = this._slotSession.machineInfo.bets.find(
          (b) => Math.abs(b.bet - minBet) > EPSILON
        )!.bet;
        return betAfterMin * this._slotSession.currentLine;

      case BetTypeParam.HalfDefault:
        return halfDefaultBet * this._slotSession.currentLine;

      case BetTypeParam.ExtraBet:
        return bet * this._slotSession.currentLine;
    }

    return bet * this._slotSession.currentLine;
  }
}
