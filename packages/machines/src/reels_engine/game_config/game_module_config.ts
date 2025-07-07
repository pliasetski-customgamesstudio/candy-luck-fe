import { Vector2, Container } from '@cgs/syd';
import { AbstractSpinConfig } from './abstract_spin_config';
import { SpinConfig, AnticipationConfig, IconWithValuesConfig, StaticConfig } from './game_config';
import { AbstractGameConfig } from './abstract_game_config';

export class GameModuleConfig implements AbstractGameConfig {
  private _configDto: Map<any, any>;
  private _fps: number;
  private _displayResolution: Vector2;
  public regularSpinConfig: SpinConfig;
  public freeSpinConfig: SpinConfig;
  public giftSpinConfig: SpinConfig;
  public anticipationConfig: AnticipationConfig;
  public iconWithValuesConfig: IconWithValuesConfig;
  public staticConfig: StaticConfig;

  constructor(container: Container, configDto: Map<any, any>, displayResolution: Vector2) {
    this._configDto = configDto;
    this._displayResolution = displayResolution;
    this._fps = 50;

    if (this._configDto) {
      if (this._configDto.has('regularSpin')) {
        this.regularSpinConfig = new SpinConfig(
          container,
          this._configDto.get('regularSpin'),
          this._fps,
          Math.round(this._displayResolution.y)
        );
      }

      if (this._configDto.has('freeSpin')) {
        this.freeSpinConfig = new SpinConfig(
          container,
          this._configDto.get('freeSpin'),
          this._fps,
          Math.round(this._displayResolution.y)
        );
      }

      if (this._configDto.has('giftSpin')) {
        this.giftSpinConfig = new SpinConfig(
          container,
          this._configDto.get('giftSpin'),
          this._fps,
          Math.round(this._displayResolution.y)
        );
      }

      if (this._configDto.has('anticipationParameters')) {
        this.anticipationConfig = new AnticipationConfig(
          this._configDto.get('anticipationParameters'),
          this._fps,
          Math.round(this._displayResolution.y)
        );
      }

      if (this._configDto.has('iconWithValuesParameters')) {
        this.iconWithValuesConfig = new IconWithValuesConfig(
          this._configDto.get('iconWithValuesParameters')
        );
      }

      if (this._configDto.has('staticConfig')) {
        this.staticConfig = new StaticConfig(this._configDto.get('staticConfig'));
      }
    }
  }

  getNamedConfig(name: string): AbstractSpinConfig | null {
    return null;
  }

  getFakeConfig(name: string): any {
    return this._configDto.has(name)
      ? new StaticConfig(this._configDto.get(name))
      : new StaticConfig(this._configDto.get('staticConfig'));
  }

  getSlotFeatureConfig(type: any): any {
    return null;
  }
}
