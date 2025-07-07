import {
  InternalCollapsingSpecGroup,
  InternalCollapsingRound,
  Line,
  SpecialSymbolGroup,
} from 'machines';
import { SpecialSymbolGroupResponseConverter } from 'machines/src/reels_engine_library';
import { ResponseConverter } from 'common';

class CollapsingGroupResponseConverter
  implements ResponseConverter<Map, InternalCollapsingSpecGroup>
{
  constructor() {}

  ConvertObject(group: Map): InternalCollapsingSpecGroup {
    const groups = group.get('groups');
    const result = new InternalCollapsingSpecGroup();
    result.groups = new Array<InternalCollapsingRound>();

    const specialSymbolGroupsConverter = new SpecialSymbolGroupResponseConverter();

    for (const group of groups) {
      const round = new InternalCollapsingRound();
      const responseWinLines = group.get('winLines');

      round.multiplier = group.get('multiplier');
      round.newReels = group.get('newReels');
      round.positions = group.get('positions');
      round.type = group.get('type');
      round.roundWin = group.get('roundWin');

      if (responseWinLines) {
        round.winLines = new Array<Line>();

        for (const responseLine of responseWinLines) {
          const line = new Line();
          const win = responseLine.get('win');
          line.iconsIndexes = responseLine.get('positions');
          line.lineIndex = responseLine.get('lineNumber');
          line.multiplier = responseLine.get('multiplier');
          line.symbolId = responseLine.get('symbol');
          line.winAmount = win;
          round.winLines.push(line);
        }
      }

      const defaultSpecGroups = group.get('defaultSpecGroups');
      if (defaultSpecGroups) {
        round.specialSymbolGroups = new Array<SpecialSymbolGroup>();
        for (const defaultSpecGroup of defaultSpecGroups) {
          const group = new SpecialSymbolGroup();
          group.positions = defaultSpecGroup.get('positions');
          group.previousPositions = defaultSpecGroup.get('previousPositions');
          group.totalJackPotWin = defaultSpecGroup.has('totalwinDouble')
            ? defaultSpecGroup.get('totalwinDouble')
            : defaultSpecGroup.get('totalWin');
          group.type = defaultSpecGroup.get('type');
          group.symbolId = defaultSpecGroup.get('symbolId');
          group.collectCount = defaultSpecGroup.get('collectCount');

          round.specialSymbolGroups.push(group);
        }
      }

      result.groups.push(round);
    }

    return result;
  }
}
