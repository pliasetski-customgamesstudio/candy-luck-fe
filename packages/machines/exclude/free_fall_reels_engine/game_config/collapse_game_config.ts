import { Container } from 'inversify';
import { ReelsEngineGameConfig, CollapsingSpinConfig, SpinConfig } from 'machines';
import { Vector2 } from 'syd';
import {
  ReelsEngine,
  ISlotGameEngineProvider,
  IReelsEngineProvider,
} from 'machines/src/reels_engine_library';

class CollapseGameConfig extends ReelsEngineGameConfig {
  regularSpinCollapsingConfig: CollapsingSpinConfig;
  freeSpinCollapsingConfig: CollapsingSpinConfig;

  constructor(container: Container, configDto: Map<string, any>, displayResolution: Vector2) {
    super(container, configDto, displayResolution);
    if (configDto) {
      if (configDto.has('regularSpin')) {
        this.regularSpinConfig = new FreeFallSpinConfig(
          container,
          configDto.get('regularSpin'),
          this.fps,
          Math.round(displayResolution.y)
        );
        this.regularSpinCollapsingConfig = new CollapsingSpinConfig(configDto.get('regularSpin'));
      }
      if (configDto.has('freeSpin')) {
        this.freeSpinConfig = new FreeFallSpinConfig(
          container,
          configDto.get('freeSpin'),
          this.fps,
          Math.round(displayResolution.y)
        );
        this.freeSpinCollapsingConfig = new CollapsingSpinConfig(configDto.get('freeSpin'));
      }
    }
  }
}

class FreeFallSpinConfig extends SpinConfig {
  private _engine: ReelsEngine;
  private _container: Container;
  get Engine(): ReelsEngine {
    if (!this._engine) {
      this._engine = (
        this._container.forceResolve<ISlotGameEngineProvider>(
          T_ISlotGameEngineProvider
        ) as IReelsEngineProvider
      ).reelsEngine;
    }
    return this._engine;
  }

  constructor(
    container: Container,
    configDto: Map<string, any>,
    fps: number,
    displayHeight: number
  ) {
    super(container, configDto, fps, displayHeight);
    this._container = container;
  }

  get spinSpeed(): number {
    return (
      (((this.configDto.get('spinSpeed') / 1.7) * this.fps * this.displayHeight) / 640) *
      this.speedMultiplier
    );
  }

  get singleEntitySpinSpeed(): number {
    let speed =
      (((this.configDto.get('spinSpeed') / 1.7) * this.fps * this.displayHeight) / 640) *
      this.speedMultiplier;
    let SingleMaxSpeed =
      ((this.Engine.ReelConfig.symbolSize.y / 1.7) * this.fps * this.displayHeight) / 640;
    return speed > SingleMaxSpeed ? SingleMaxSpeed : speed;
  }
}
