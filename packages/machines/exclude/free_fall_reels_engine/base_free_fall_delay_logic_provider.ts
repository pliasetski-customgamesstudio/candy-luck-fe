import { Random } from 'dart:math';
import { Container } from 'syd';
import {
  ISlotGameEngineProvider,
  IReelsEngineProvider,
  IGameConfigProvider,
} from 'machines/machines.dart';
import { InternalReelsConfig, CollapsingSpinConfig } from 'machines/src/reels_engine_library';

class BaseFreeFallDelayLogicProvider implements IFreeFallDelayLogicProvider {
  private _random: Random = new Random();
  private _reelsConfig: InternalReelsConfig;
  get reelsConfig(): InternalReelsConfig {
    return this._reelsConfig;
  }
  private _collapsingSpinConfig: CollapsingSpinConfig;
  get collapsingSpinConfig(): CollapsingSpinConfig {
    return this._collapsingSpinConfig;
  }

  constructor(container: Container) {
    this._reelsConfig = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine.internalConfig;
    this._collapsingSpinConfig =
      container.forceResolve<IGameConfigProvider>(
        T_IGameConfigProvider
      ).gameConfig.regularSpinCollapsingConfig;
  }

  getReelFallDelay(): number[] {
    const randomReel: number = this._random.nextInt(this._reelsConfig.reelCount);
    const reelsDelay: number[] = new Array(this._reelsConfig.reelCount).fill(0.0);

    if (randomReel % 2 === 0) {
      let multiplier: number = 0;
      for (let i: number = randomReel; i < this._reelsConfig.reelCount; i++) {
        reelsDelay[i] =
          multiplier * this._collapsingSpinConfig.collapsingParameters.reelFallingStartDelay;
        multiplier++;
      }
      multiplier = 0;

      for (let j: number = randomReel; j >= 0; j--) {
        reelsDelay[j] =
          multiplier * this._collapsingSpinConfig.collapsingParameters.reelFallingStartDelay;
        multiplier++;
      }
    } else {
      for (let i: number = 0; i < reelsDelay.length; i++) {
        if (i % 2 === 0) {
          reelsDelay[i] = this._collapsingSpinConfig.collapsingParameters.reelFallingStartDelay;
        }
      }
    }
    return reelsDelay;
  }
}
