import {
  InternalFreeSpinsInfo,
  InternalFreeSpinsGroup,
  SpecialSymbolGroup,
  FreeSpinGameCompletionDataResponse,
} from '@cgs/common';
import {
  FreeSpinsInfoDTO,
  FreeSpinsGroupDTO,
  DefaultSpecGroupDTO,
  FreeSpinGameCompletionDataDTO,
} from '@cgs/network';

export class SpinResponseConverterExtensions {
  static toInternalResponse(freeSpinsInfo: FreeSpinsInfoDTO): InternalFreeSpinsInfo | null {
    if (!freeSpinsInfo) {
      return null;
    }

    const result: InternalFreeSpinsInfo = new InternalFreeSpinsInfo();
    result.freeSpinGroups =
      freeSpinsInfo.freeSpinGroups?.map((e) => this.toInternalFreeSpinsGroup(e)) ?? null;
    result.currentFreeSpinsGroup = this.toInternalFreeSpinsGroup(
      freeSpinsInfo?.currentFreeSpinsGroup
    );
    result.name = freeSpinsInfo.name!;
    result.event = freeSpinsInfo.event!;
    result.freeSpinsAdded = freeSpinsInfo.freeSpinsAdded;
    result.totalFreeSpins = freeSpinsInfo.totalFreeSpins!;
    result.totalWin = freeSpinsInfo.totalWin!;
    result.parameter = freeSpinsInfo.parameter!;
    result.extraEvents = freeSpinsInfo.extraEvents;
    return result;
  }

  static toInternalFreeSpinsGroup(
    freeSpinsInfo: FreeSpinsGroupDTO | null
  ): InternalFreeSpinsGroup | null {
    if (!freeSpinsInfo) {
      return null;
    }

    const result = new InternalFreeSpinsGroup();
    result.count = freeSpinsInfo.count!;
    result.usedCount = freeSpinsInfo.usedCount!;
    result.bet = freeSpinsInfo.bet!;
    result.lines = freeSpinsInfo.lines!;
    result.name = freeSpinsInfo.name!;
    result.win = freeSpinsInfo.win!;
    result.betCalculation = freeSpinsInfo.betCalculation!;
    return result;
  }

  static ConvertObject(obj: DefaultSpecGroupDTO[]): SpecialSymbolGroup[] {
    const specialSymbolGroups: SpecialSymbolGroup[] = [];

    for (const specialSympol of obj) {
      const symbol: SpecialSymbolGroup = new SpecialSymbolGroup();
      symbol.positions = specialSympol.positions;
      symbol.positions2d = specialSympol.positions2d;
      symbol.positionsWin = specialSympol.positionsWin;
      symbol.previousPositions = specialSympol.previousPositions;
      symbol.type = specialSympol.type;
      symbol.subType = specialSympol.subType;
      symbol.totalJackPotWin =
        typeof specialSympol.totalwinDouble === 'number'
          ? specialSympol.totalwinDouble
          : specialSympol.totalWin!;
      symbol.symbolId = specialSympol.symbolId;
      symbol.previousSymbolId = specialSympol.previousSymbolId;
      symbol.collectCount = specialSympol.collectCount;
      symbol.affectedModules = specialSympol.spreadModules
        ? specialSympol.spreadModules.map((s) => s.toString())
        : null;

      specialSymbolGroups.push(symbol);
    }

    return specialSymbolGroups;
  }

  static toInternalFreeSpinGameCompletionData(
    freeSpinGameCompletionDatas: FreeSpinGameCompletionDataDTO[] | null | undefined
  ): FreeSpinGameCompletionDataResponse[] | null {
    if (freeSpinGameCompletionDatas && freeSpinGameCompletionDatas.length) {
      const data: FreeSpinGameCompletionDataResponse[] = [];
      for (const freeSpinGameCompletionData of freeSpinGameCompletionDatas) {
        const result: FreeSpinGameCompletionDataResponse = new FreeSpinGameCompletionDataResponse();
        result.freeSpinName = freeSpinGameCompletionData.freeSpinName as string;
        result.totalWin = freeSpinGameCompletionData.totalWin as number;
        result.freeSpinCounter = freeSpinGameCompletionData.freeSpinCounter as number;
        data.push(result);
      }
      return data;
    }

    return null;
  }
}
