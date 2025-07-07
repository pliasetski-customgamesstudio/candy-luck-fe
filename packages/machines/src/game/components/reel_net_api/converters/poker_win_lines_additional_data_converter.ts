import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import { InternalPokerWinLinesData, Line } from '@cgs/common';

export class PokerWinLinesAdditionalDataConverter
  implements ResponseConverter<Record<string, any>, InternalPokerWinLinesData>
{
  ConvertObject(pokerWinLinesData: Record<string, any>): InternalPokerWinLinesData {
    const pokerWinLines = pokerWinLinesData['pokerWinLines'];
    const winLinesData = new InternalPokerWinLinesData();
    winLinesData.winLines = [];

    for (const pokerWinLine of pokerWinLines) {
      const line = new Line();

      line.iconsIndexes = [];
      const positions = pokerWinLine['positions'];
      if (positions) {
        line.iconsIndexes.push(...positions);
      }

      line.lineIndex = pokerWinLine['lineNumber'];
      line.winAmount = pokerWinLine['win'];
      line.multiplier = pokerWinLine['multiplier'];
      line.symbolId = pokerWinLine['symbol'];
      line.winName = pokerWinLine['combinationName'];

      winLinesData.winLines.push(line);
    }

    return winLinesData;
  }
}
