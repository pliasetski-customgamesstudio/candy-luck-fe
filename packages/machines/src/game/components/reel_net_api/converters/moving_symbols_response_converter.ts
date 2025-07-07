import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import { InternalMovingPosition, InternalMovingSymbols } from '@cgs/common';

export class MovingSymbolsResponseConverter
  implements ResponseConverter<Record<string, any>, InternalMovingSymbols>
{
  ConvertObject(obj: Record<string, any>): InternalMovingSymbols {
    const result: InternalMovingSymbols = new InternalMovingSymbols();
    const current = obj['current'];
    const next = obj['next'];

    if (current) {
      result.current = [];
      for (const movingPosition of current) {
        const movePos = new InternalMovingPosition();
        movePos.posFrom = movingPosition['posFrom'];
        movePos.posTo = movingPosition['posTo'];
        movePos.type = movingPosition['type'];
        movePos.value = movingPosition['value'];
        result.current.push(movePos);
      }
    }

    if (next) {
      result.next = [];
      for (const movingPosition of next) {
        const movePos = new InternalMovingPosition();
        movePos.posFrom = movingPosition['posFrom'];
        movePos.posTo = movingPosition['posTo'];
        movePos.type = movingPosition['type'];
        movePos.value = movingPosition['value'];
        result.next.push(movePos);
      }
    }

    return result;
  }
}
