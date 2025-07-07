import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import {
  InternalRespinRound,
  InternalRespinSpecGroup,
  Line,
  ReelWinPosition,
  SpecialSymbolGroup,
} from '@cgs/common';

export class RespinGroupResponseConverter
  implements ResponseConverter<Record<string, any>, InternalRespinSpecGroup>
{
  ConvertObject(group: Record<string, any>): InternalRespinSpecGroup {
    const groups = group['groups'];
    const result = new InternalRespinSpecGroup();
    result.groups = [];
    result.firstWin = group['firstWin'];

    for (const group of groups) {
      const round = new InternalRespinRound();
      const responseWinLines = group['winLines'];

      round.winName = group['winningName'];
      round.newViewReels = group['newViewReels'];
      round.fixedPositions = group['fixedPositions'];
      round.type = group['type'];
      round.multiplier = group['multiplier'];
      round.roundWin = group['roundWin'];

      if (responseWinLines) {
        round.winLines = [];

        for (const responseLine of responseWinLines) {
          const line = new Line();
          const win = responseLine['win'];
          line.iconsIndexes = responseLine['positions'];
          line.lineIndex = responseLine['lineNumber'];
          line.multiplier = responseLine['multiplier'];
          line.symbolId = responseLine['symbol'];
          line.winAmount = win;
          round.winLines.push(line);
        }
      }

      const responseWinPositions = group['winPositions'];
      round.winPositions = [];
      if (responseWinPositions) {
        for (const responsePosition of responseWinPositions) {
          const position = new ReelWinPosition(
            responsePosition['positions'],
            responsePosition['type'],
            responsePosition['symbol'],
            responsePosition['winDouble']
          );
          round.winPositions.push(position);
        }
      }

      const defaultSpecGroups = group['defaultSpecGroups'];
      if (defaultSpecGroups) {
        round.specialSymbolGroups = [];
        for (const defaultSpecGroup of defaultSpecGroups) {
          const group = new SpecialSymbolGroup();
          group.positions = defaultSpecGroup['positions'];
          group.positionsWin = defaultSpecGroup['positionsWin'];
          group.previousPositions = defaultSpecGroup['previousPositions'];
          group.totalJackPotWin =
            defaultSpecGroup['totalwinDouble'] !== undefined
              ? defaultSpecGroup['totalwinDouble']
              : defaultSpecGroup['totalWin'];
          group.type = defaultSpecGroup['type'];
          group.symbolId = defaultSpecGroup['symbolId'];
          group.collectCount = defaultSpecGroup['collectCount'];

          round.specialSymbolGroups.push(group);
        }
      }

      result.groups.push(round);
    }

    return result;
  }
}
