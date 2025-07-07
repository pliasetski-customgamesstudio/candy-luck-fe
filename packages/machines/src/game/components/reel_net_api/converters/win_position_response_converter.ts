import { ReelWinPosition } from '@cgs/common';
import { WinPositionDTO } from '@cgs/network';
import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';

export class WinPositionResponseConverter extends ResponseConverter<
  WinPositionDTO[],
  ReelWinPosition[]
> {
  ConvertObject(responsePositions: WinPositionDTO[]): ReelWinPosition[] {
    const winPositions: ReelWinPosition[] = [];
    for (const rp of responsePositions) {
      const winPosition = new ReelWinPosition(
        rp.positions!,
        rp.type!,
        rp.symbol,
        rp.winDouble || 0
      );
      winPositions.push(winPosition);
    }

    return winPositions;
  }
}
