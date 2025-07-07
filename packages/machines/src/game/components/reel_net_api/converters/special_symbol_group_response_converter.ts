import { SpecialSymbolGroup } from '@cgs/common';
import { DefaultSpecGroupDTO } from '@cgs/network';
import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';

export class SpecialSymbolGroupResponseConverter extends ResponseConverter<
  DefaultSpecGroupDTO[],
  SpecialSymbolGroup[]
> {
  ConvertObject(obj: DefaultSpecGroupDTO[]): SpecialSymbolGroup[] {
    const specialSymbolGroups: SpecialSymbolGroup[] = [];

    for (const specialSympol of obj) {
      const symbol = new SpecialSymbolGroup();
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
        ? specialSympol.spreadModules.map((s) => s.toString()).flat()
        : null;

      specialSymbolGroups.push(symbol);
    }

    return specialSymbolGroups;
  }
}
