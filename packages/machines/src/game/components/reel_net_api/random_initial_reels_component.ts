import { Container } from '@cgs/syd';
import { InitialReelsComponent } from './initial_reels_component';
import { IconModelComponent } from '../icon_model_component';
import { T_IconModelComponent } from '../../../type_definitions';
import { InternalReelsConfig } from '../../../reels_engine/internal_reels_config';
import { IconModel } from '../icon_model';

export class RandomInitialReelsComponent extends InitialReelsComponent {
  private _iconModel: IconModel;
  private _generatedIcons: Map<number, number> = new Map();

  constructor(container: Container, iconLimits: Map<number, number> | null = null) {
    super(container, iconLimits);
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
  }

  getInitialReels(
    reelsCount: number,
    linesCount: number,
    _internalConfig: InternalReelsConfig
  ): number[][] {
    const init: number[][] = new Array(reelsCount);

    for (let reel = 0; reel < reelsCount; ++reel) {
      for (let line = 0; line < linesCount; ++line) {
        if (!init[reel]) {
          init[reel] = new Array(linesCount).fill(0);
        }
        do {
          init[reel][line] =
            this._iconModel.minStaticIconId +
            this._random.nextInt(this._iconModel.maxStaticIconId - this._iconModel.minStaticIconId);
        } while (
          !this._iconModel.hasStaticIcon(init[reel][line]) ||
          (this._iconLimits &&
            this._iconLimits.has(init[reel][line]) &&
            this._generatedIcons.has(init[reel][line]) &&
            this._iconLimits.get(init[reel][line])! <= this._generatedIcons.get(init[reel][line])!)
        );
      }
    }

    return init;
  }

  getSpinnedReels(spinedReels: number[][]): number[][] {
    for (let i = 0; i < spinedReels.length; i++) {
      for (let j = 0; j < spinedReels[i].length; j++) {
        do {
          spinedReels[i][j] =
            this._iconModel.minStaticIconId +
            this._random.nextInt(this._iconModel.maxStaticIconId - this._iconModel.minStaticIconId);
        } while (!this._iconModel.hasStaticIcon(spinedReels[i][j]));
      }
    }

    return spinedReels;
  }
}
