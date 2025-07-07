import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import {
  InternalDraculaSpecGroup,
  InternalMultiSpinGroup,
  InternalMultiSpinRound,
  Line,
  ReelWinPosition,
  SpecialSymbolGroup,
} from '@cgs/common';

export class MultispinGroupResponseConverter
  implements ResponseConverter<Record<string, any>, InternalMultiSpinGroup>
{
  ConvertObject(obj: Record<string, any>): InternalMultiSpinGroup {
    const result: InternalMultiSpinGroup = new InternalMultiSpinGroup();
    result.firstWin = obj['firstWin'];
    const jackpotGroup = obj['jackPotsSpecGroup'];
    const mainGroupsList = obj['groups'];
    result.jackPotsSpecGroup = new InternalDraculaSpecGroup();
    result.jackPotsSpecGroup.dJackPotInitialValues = jackpotGroup['dJackPotInitialValues'];
    result.jackPotsSpecGroup.dJackPotValues = jackpotGroup['dJackPotValues'];
    result.jackPotsSpecGroup.jackPotInitialValues = jackpotGroup['dJackPotInitialValues'];
    result.jackPotsSpecGroup.jackPotValues = jackpotGroup['dJackPotValues'];
    result.jackPotsSpecGroup.type = jackpotGroup['type'];
    if (mainGroupsList) {
      result.groups = [];
      for (const round of mainGroupsList) {
        const mainGroup = new InternalMultiSpinRound();
        mainGroup.totalWin = round['totalWin'];
        mainGroup.newViewReels = round['newViewReels'];

        const responseWinLines = round['winLines'];
        mainGroup.winLines = [];
        if (responseWinLines) {
          for (const responseLine of responseWinLines) {
            const line = new Line();
            const win: number = responseLine['win'];
            line.iconsIndexes = responseLine['positions'];
            line.lineIndex = responseLine['lineNumber'];
            line.multiplier = responseLine['multiplier'];
            line.symbolId = responseLine['symbol'];
            line.winAmount = win;
            mainGroup.winLines.push(line);
          }
        }

        const responseWinPositions = round['winPositions'];
        mainGroup.winPositions = [];
        if (responseWinPositions) {
          for (const responsePosition of responseWinPositions) {
            const position = new ReelWinPosition(
              responsePosition['positions'],
              responsePosition['type'],
              responsePosition['symbol'],
              responsePosition['winDouble']
            );
            mainGroup.winPositions.push(position);
          }
        }

        const defaultSpecGroups = round['defaultSpecGroups'];
        mainGroup.defaultSpecGroups = [];
        if (defaultSpecGroups) {
          for (const defaultSpecGroup of defaultSpecGroups) {
            const group = new SpecialSymbolGroup();
            group.positions = defaultSpecGroup['positions'];
            group.previousPositions = defaultSpecGroup['previousPositions'];
            group.totalJackPotWin =
              defaultSpecGroup['totalwinDouble'] !== undefined
                ? defaultSpecGroup['totalwinDouble']
                : defaultSpecGroup['totalWin'];
            group.type = defaultSpecGroup['type'];
            group.symbolId = defaultSpecGroup['symbolId'];
            group.collectCount = defaultSpecGroup['collectCount'];

            mainGroup.defaultSpecGroups.push(group);
          }
        }

        result.groups.push(mainGroup);
      }
    }
    return result;
  }
}
