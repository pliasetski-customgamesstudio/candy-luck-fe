import { Line } from '@cgs/common';
import { WinLineDTO } from '@cgs/network';
import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';

export class WinLineResponseConverter extends ResponseConverter<WinLineDTO[], Line[]> {
  ConvertObject(responseLines: WinLineDTO[]): Line[] {
    const winLines: Line[] = [];
    for (const rl of responseLines) {
      const line = new Line();

      line.iconsIndexes = rl.positions || [];
      line.lineIndex = rl.lineNumber!;
      line.winAmount = rl.win!;
      line.multiplier = rl.multiplier;
      line.symbolId = rl.symbol!;

      winLines.push(line);
    }

    return winLines;
  }
}
