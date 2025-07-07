import {
  IBonusResponse,
  InternalFreeSpinsInfo,
  InternalFreeSpinsGroup,
  SpecialSymbolGroup,
  Line,
  IBonusRound,
  IRoundButton,
} from '@cgs/common';
import {
  BonusResponse,
  BonusResult,
  BonusRound,
  ExtraGain,
  PaytableItem,
  RoundButton,
} from '@cgs/features';
import {
  BonusButtonDTO,
  BonusInfoDTO,
  BonusResultDTO,
  BonusRoundDTO,
  DefaultSpecGroupDTO,
  ExtraGainsDTO,
  FreeSpinsGroupDTO,
  FreeSpinsInfoDTO,
  RoundPaytableItemDTO,
  WinLine,
} from '@cgs/network';

export class BonusConverterExtention {
  static toInternalResponse(bonusInfo: BonusInfoDTO | null): IBonusResponse | null {
    if (!bonusInfo) {
      return null;
    }

    const response: IBonusResponse = new BonusResponse();
    let internalFreeSpinsInfo: InternalFreeSpinsInfo | null = null;
    let internalBonusInfo: BonusResponse | null = null;
    let internalScatterInfo: BonusResponse | null = null;
    const freeSpinsInfo: FreeSpinsInfoDTO | null = bonusInfo.freeSpinsInfo;
    const bonusGame: BonusInfoDTO | null = bonusInfo.bonusInfo;
    const scatterGame: BonusInfoDTO | null = bonusInfo.scatterInfo;
    if (freeSpinsInfo) {
      internalFreeSpinsInfo = new InternalFreeSpinsInfo();
      internalFreeSpinsInfo.freeSpinGroups =
        freeSpinsInfo.freeSpinGroups?.map((e) => this.toInternalFreeSpinsGroup(e)) ?? null;
      internalFreeSpinsInfo.currentFreeSpinsGroup = this.toInternalFreeSpinsGroup(
        freeSpinsInfo.currentFreeSpinsGroup
      );
      internalFreeSpinsInfo.name = freeSpinsInfo.name as string;
      internalFreeSpinsInfo.event = freeSpinsInfo.event as string;
      internalFreeSpinsInfo.freeSpinsAdded = freeSpinsInfo.freeSpinsAdded;
      internalFreeSpinsInfo.extraEvents = freeSpinsInfo.extraEvents;

      internalFreeSpinsInfo.totalFreeSpins = freeSpinsInfo.totalFreeSpins ?? 0;
      internalFreeSpinsInfo.totalWin = freeSpinsInfo.totalWin ?? 0;
      internalFreeSpinsInfo.parameter = freeSpinsInfo.parameter ?? 0;
    }
    if (bonusGame) {
      internalBonusInfo = new BonusResponse();
      internalBonusInfo.bonusFinished = false;
      internalBonusInfo.bonusStarted = true;
      internalBonusInfo.bonusType = bonusGame.bonusType ?? '';
      internalBonusInfo.type = bonusGame.type ?? '';
      internalBonusInfo.configuredBets = bonusGame.configuredBets!;
      internalBonusInfo.currentRound = bonusGame.currentRound
        ? this.toInternalBonusRound(bonusGame.currentRound)
        : null;
      internalBonusInfo.result = bonusGame.result ? this.toInternalResult(bonusGame.result) : null;
    }
    if (scatterGame) {
      internalScatterInfo = new BonusResponse();
      internalScatterInfo.bonusFinished = false;
      internalScatterInfo.bonusStarted = true;
      internalScatterInfo.bonusType = scatterGame.bonusType!;
      internalScatterInfo.type = scatterGame.type!;
      internalScatterInfo.configuredBets = scatterGame.configuredBets;
      internalScatterInfo.currentRound = scatterGame.currentRound
        ? this.toInternalBonusRound(scatterGame.currentRound)
        : null;
      internalScatterInfo.result = scatterGame.result
        ? this.toInternalResult(scatterGame.result)
        : null;
    }
    const internalFreeSpinsRebuyInfo = null;

    response.freeSpinsInfo = internalFreeSpinsInfo ?? null;
    response.bonusInfo = internalBonusInfo;
    response.scatterInfo = internalScatterInfo;
    response.freeSpinReBuyInfo = internalFreeSpinsRebuyInfo ?? null;
    response.bonusFinished = bonusInfo.bonusFinished ?? false;
    response.bonusStarted = bonusInfo.bonusStarted ?? false;
    response.currentRound = bonusInfo.currentRound
      ? this.toInternalBonusRound(bonusInfo.currentRound)
      : null;
    response.previousRounds = bonusInfo.previousRounds
      ? bonusInfo.previousRounds.map((round) => this.toInternalBonusRound(round))
      : null;
    response.nextRound = bonusInfo.nextRound
      ? this.toInternalBonusRound(bonusInfo.nextRound)
      : null;
    response.result = bonusInfo.result ? this.toInternalResult(bonusInfo.result) : null;
    response.type = bonusInfo.type ?? '';
    response.configuredBets = bonusInfo.configuredBets;
    response.bonusType = bonusInfo.bonusType ?? '';
    //response.userParlayInfo = toInternalUserParlayInfo(bonusInfo);

    return response;
  }

  static toInternalFreeSpinsGroup(
    freeSpinsInfo: FreeSpinsGroupDTO | null
  ): InternalFreeSpinsGroup | null {
    if (!freeSpinsInfo) {
      return null;
    }

    const result: InternalFreeSpinsGroup = new InternalFreeSpinsGroup();
    result.count = freeSpinsInfo.count as number;
    result.usedCount = freeSpinsInfo.usedCount as number;
    result.bet = freeSpinsInfo.bet as number;
    result.lines = freeSpinsInfo.lines as number;
    result.name = freeSpinsInfo.name as string;
    result.win = freeSpinsInfo.win as number;
    result.betCalculation = freeSpinsInfo.betCalculation as string;
    return result;
  }

  static toInternalBonusRound(bonusRound: BonusRoundDTO): IBonusRound {
    // if (!bonusRound) {
    //   return null;
    // }

    const response: IBonusRound = new BonusRound();
    response.attemps = bonusRound.attemps ?? 0;
    response.attempsUsed = bonusRound.attempsUsed ?? 0;
    response.notSelectedButtons = bonusRound.notSelectedButtons
      ? bonusRound.notSelectedButtons.map((btn) => this.toInternalButton(btn))
      : null;
    response.roundNumber = bonusRound.roundNumber ?? 0.0;
    response.roundType = bonusRound.roundType!;
    response.selectedButtons = bonusRound.selectedButtons
      ? bonusRound.selectedButtons.map((btn) => this.toInternalButton(btn))
      : null;
    response.serverSelectedButtons = bonusRound.serverSelectedButtons
      ? bonusRound.serverSelectedButtons.map((btn) => this.toInternalButton(btn))
      : null;
    response.paytable = bonusRound.paytable
      ? bonusRound.paytable.map((btn) => this.toInternalPaytableItem(btn))
      : null;

    return response;
  }

  static toInternalButton(bonusButton: BonusButtonDTO): IRoundButton {
    // if (!bonusButton) {
    //   return null;
    // }

    const response: IRoundButton = new RoundButton();
    response.index = bonusButton.index ?? 0;
    response.type = bonusButton.type;
    response.value = bonusButton.value ?? 0;
    response.totalValue = bonusButton.totalValue ?? 0;
    response.routingIndex = bonusButton.routingIndex ?? 0;
    response.view = bonusButton.view;
    response.extraValues = bonusButton.extraValues?.map((gains) => this.toInternalExtraGain(gains));

    return response;
  }

  static toInternalExtraGain(item: ExtraGainsDTO): ExtraGain {
    const extra: ExtraGain = new ExtraGain();

    extra.type = item.type ?? '';
    extra.value = item.value ?? 0;

    return extra;
  }

  static toInternalPaytableItem(item: RoundPaytableItemDTO): PaytableItem {
    // if (!item) {
    //   return null;
    // }
    const response: PaytableItem = new PaytableItem();
    response.index = item.index ?? 0;
    response.type = item.type ?? '';
    response.value = item.value ?? 0;
    response.totalValue = item.totalValue ?? 0;
    response.extraValues = item.extraValues!.map((gains) => this.toInternalExtraGain(gains))!;

    return response;
  }

  static toInternalResult(result: BonusResultDTO): BonusResult {
    const response: BonusResult = new BonusResult();
    response.bonusWin = result.bonusWin ?? 0.0;
    response.totalWin = result.totalWin ?? 0.0;
    response.specGroups = result.specGroups
      ? result.specGroups.map((group) => this.toInternalSpecGroup(group))
      : null;
    response.additionWin = result.additionWin ?? 0.0;
    response.multiplier = result.multiplier ?? 1;
    response.bet = result.bet ?? 0;
    response.lines = result.lines ?? 0;
    response.winName = result.winningName ?? '';
    response.betCalculation = result.betCalculation ?? '';
    response.winLines = result.winlines ? this.convertBonusWinLine(result.winlines) : null;
    return response;
  }

  static toInternalSpecGroup(item: DefaultSpecGroupDTO): SpecialSymbolGroup {
    // if (!item) {
    //   return null;
    // }
    const response: SpecialSymbolGroup = new SpecialSymbolGroup();
    response.positions = item.positions;
    response.positions2d = item.positions2d;
    response.positionsWin = item.positionsWin;
    response.previousPositions = item.previousPositions;
    response.type = item.type;
    response.subType = item.subType;
    response.collectCount = item.collectCount;
    response.totalJackPotWin = item.totalwinDouble ?? item.totalWin ?? 0;
    response.symbolId = item.symbolId;
    response.previousSymbolId = item.previousSymbolId;
    response.affectedModules = item.spreadModules
      ? item.spreadModules.map((s) => s.toString())
      : null;

    return response;
  }

  static convertBonusWinLine(bonusWinLines: WinLine[] | null): Line[] | null {
    if (!bonusWinLines || bonusWinLines.length == 0) return null;
    const winLines: Line[] = [];
    for (const bonusWinLine of bonusWinLines) {
      const line: Line = new Line();
      line.iconsIndexes = [];
      const positions = bonusWinLine.positions as number[];
      for (const pos of positions) {
        line.iconsIndexes.push(pos);
      }
      line.lineIndex = bonusWinLine.lineNumber ?? -1;
      line.winAmount = bonusWinLine.win ?? 0;
      line.multiplier = bonusWinLine.multiplier;
      line.symbolId = bonusWinLine.symbol ?? -1;
      winLines.push(line);
    }
    return winLines;
  }

  //  static toInternalUserParlayInfo(bonusInfo: network.BonusInfo): IBonusUserParlayInfo {
  //    const response: BonusUserParlayInfo = new BonusUserParlayInfo();
  //    response.isUserParlayFinished = bonusInfo && bonusInfo.userParlayInfo && bonusInfo.userParlayInfo.state &&
  //                                    bonusInfo.userParlayInfo.state.currentValue >= bonusInfo.userParlayInfo.state.minValue
  //                                    && bonusInfo.userParlayInfo.state.parlayState != "rewarded";
  //
  //    return response;
  //  }
}
