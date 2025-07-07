import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import { SubstituteViewDTO } from '@cgs/network';
import { SubstituteReelViews } from '@cgs/common';

export class FakeMultireelReplacerConverter extends ResponseConverter<
  SubstituteViewDTO[],
  SubstituteReelViews[]
> {
  ConvertObject(obj: SubstituteViewDTO[]): SubstituteReelViews[] {
    const subtituteReelViews: SubstituteReelViews[] = [];

    for (const rl of obj) {
      const view: SubstituteReelViews = new SubstituteReelViews();
      view.chances = [];
      view.symbols = [];

      if (rl.chances) {
        for (const chance of rl.chances) {
          view.chances.push(chance);
        }
      }
      if (rl.symbols) {
        for (const symbol of rl.symbols) {
          view.symbols.push(symbol);
        }
      }
      view.reelId = rl.reelId!;
      subtituteReelViews.push(view);
    }

    return subtituteReelViews;
  }
}
