import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import { InternalExtraWinSymbolsSpecGroup, Line } from '@cgs/common';

export class ExtraWinSymbolsResponseConverter extends ResponseConverter<
  Record<string, any>,
  InternalExtraWinSymbolsSpecGroup
> {
  ConvertObject(obj: Record<string, any>): InternalExtraWinSymbolsSpecGroup {
    const result: InternalExtraWinSymbolsSpecGroup = new InternalExtraWinSymbolsSpecGroup();
    result.winBeforeFeature = obj['winBeforeFeature'];
    result.positions = obj['positions'];
    result.symbolId = obj['symbolId'];
    result.featureWin = obj['featureWin'];
    result.type = obj['type'];

    const responseWinLines = obj['winLines'];

    if (responseWinLines) {
      result.winLines = [];

      for (const responseLine of responseWinLines) {
        const line = new Line();
        const win = responseLine['win'];
        line.iconsIndexes = responseLine['positions'];
        line.lineIndex = responseLine['lineNumber'];
        line.multiplier = responseLine['multiplier'];
        line.symbolId = responseLine['symbol'];
        line.winAmount = win;
        result.winLines.push(line);
      }
    }

    return result;
  }
}
