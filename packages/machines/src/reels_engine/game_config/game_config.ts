import { Vector2, Container } from '@cgs/syd';
import { IReelsEngineProvider } from '../game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../reels_engine';
import {
  T_ISlotGameEngineProvider,
  T_StackedReelsStopSlotActionConfig,
  T_StagedFreeSpinsCollectConfig,
} from '../../type_definitions';
import { AbstractAnticipationConfig } from './abstract_anticipation_config';
import { AbstractGameConfig } from './abstract_game_config';
import { AbstractSpinConfig } from './abstract_spin_config';
import { AbstractStaticConfig } from './abstract_static_config';
import { GameModuleConfig } from './game_module_config';

export function getListOfMap(obj: Record<string, any>, key: string): Record<string, any>[] | null {
  if (!obj.hasOwnProperty(key) || obj[key] === null || obj[key] === undefined) {
    return null;
  }
  return (obj[key] as Array<any>).map((item) => item as Record<string, any>);
}

export function getListOfInt(obj: Record<string, any>, key: string): number[] | null {
  if (!obj.hasOwnProperty(key)) {
    return null;
  }
  return (obj[key] as Array<any>).map((item) => item as number);
}

export function getListOfString(obj: Record<string, any>, key: string): string[] | null {
  if (!obj.hasOwnProperty(key)) {
    return null;
  }
  return (obj[key] as Array<any>).map((item) => item as string);
}

export function getListOfDouble(obj: Record<string, any>, key: string): number[] | null {
  if (!obj.hasOwnProperty(key)) {
    return null;
  }
  return (obj[key] as Array<any>).map((item) => item as number);
}

export function getListOfListOfInt(
  obj: Record<string, any>,
  key: string
): (number[] | null)[] | null {
  if (!obj.hasOwnProperty(key) || obj[key] === null || obj[key] === undefined) {
    return null;
  }

  return (obj[key] as Array<any>).map((item) => {
    if (!Array.isArray(item)) {
      return null;
    }
    return (item as Array<any>).map((nestedItem) => nestedItem as number);
  });
}

export function forceGetListOfListOfInt(obj: Record<string, any>, key: string): number[][] {
  return getListOfListOfInt(obj, key)!.map((t) => t!);
}

export class ReelsEngineGameConfig implements AbstractGameConfig {
  private readonly _configDto: Record<string, any>;
  private readonly fps: number;
  private readonly displayResolution: Vector2;
  regularSpinConfig: AbstractSpinConfig;
  freeSpinConfig: AbstractSpinConfig;
  giftSpinConfig: AbstractSpinConfig;
  iconWithValuesConfig: IconWithValuesConfig;
  anticipationConfig: AnticipationConfig;
  staticConfig: StaticConfig;
  private readonly _namedSpinConfig: Map<string, AbstractSpinConfig> = new Map<
    string,
    AbstractSpinConfig
  >();
  moduleConfigs: Map<string, GameModuleConfig> = new Map<string, GameModuleConfig>();
  featureConfigs: Map<symbol, any> = new Map<symbol, any>();

  constructor(container: Container, configDto: Record<string, any>, displayResolution: Vector2) {
    this._configDto = configDto;
    this.displayResolution = displayResolution;
    this.fps = 60;

    if (this._configDto) {
      if (this._configDto['regularSpin']) {
        this.regularSpinConfig = new SpinConfig(
          container,
          this._configDto['regularSpin'] as Map<any, any>,
          this.fps,
          Math.round(this.displayResolution.y)
        );
      }

      if (this._configDto['freeSpin']) {
        this.freeSpinConfig = new SpinConfig(
          container,
          this._configDto['freeSpin'] as Map<any, any>,
          this.fps,
          Math.round(this.displayResolution.y)
        );
      }

      if (this._configDto['giftSpin']) {
        this.giftSpinConfig = new SpinConfig(
          container,
          this._configDto['giftSpin'] as Map<any, any>,
          this.fps,
          Math.round(this.displayResolution.y)
        );
      }

      if (this._configDto['iconWithValuesParameters']) {
        this.iconWithValuesConfig = new IconWithValuesConfig(
          this._configDto['iconWithValuesParameters'] as Map<any, any>
        );
      }

      if (this._configDto['anticipationParameters']) {
        this.anticipationConfig = new AnticipationConfig(
          this._configDto['anticipationParameters'] as Map<any, any>,
          this.fps,
          Math.round(this.displayResolution.y)
        );
      }

      if (this._configDto['staticConfig']) {
        this.staticConfig = new StaticConfig(this._configDto['staticConfig'] as Map<any, any>);
      }

      if (this._configDto['moduleConfigs']) {
        this._configDto['moduleConfigs'].forEach(
          (moduleId: string, moduleConfigDto: Map<any, any>) => {
            this.moduleConfigs.set(
              moduleId,
              new GameModuleConfig(container, moduleConfigDto, this.displayResolution)
            );
          }
        );
      }

      if (this._configDto['featuresConfiguration']) {
        const featuresConfiguration = this._configDto['featuresConfiguration'] as Record<
          string,
          any
        >;
        if (featuresConfiguration['stagedFreeSpinsCollectConfig']) {
          this.featureConfigs.set(
            T_StagedFreeSpinsCollectConfig,
            new StagedFreeSpinsCollectConfig(featuresConfiguration['stagedFreeSpinsCollectConfig'])
          );
        }
        if (featuresConfiguration['stackedReelsStopSlotActionConfig']) {
          this.featureConfigs.set(
            T_StackedReelsStopSlotActionConfig,
            new StackedReelsStopSlotActionConfig(
              featuresConfiguration['stackedReelsStopSlotActionConfig']
            )
          );
        }
      }

      if (this._configDto['namedSpinConfigs']) {
        this._configDto['namedSpinConfigs'].forEach((key: string, value: Map<any, any>) => {
          this._namedSpinConfig.set(
            key,
            new SpinConfig(container, value, this.fps, Math.round(this.displayResolution.y))
          );
        });
      }
    }
  }

  getNamedConfig(name: string): AbstractSpinConfig | null {
    if (this._namedSpinConfig.has(name)) {
      return this._namedSpinConfig.get(name) as AbstractSpinConfig;
    }
    return null;
  }

  getFakeConfig(name: string): any {
    return this._configDto[name]
      ? new StaticConfig(this._configDto[name] as Map<any, any>)
      : new StaticConfig(this._configDto['staticConfig'] as Map<any, any>);
  }

  getSlotFeatureConfig(type: symbol): any {
    return this.featureConfigs.has(type) ? this.featureConfigs.get(type) : null;
  }
}

export class SpinConfig implements AbstractSpinConfig {
  public multiplier = 1.0;
  public speedMultiplier = 1.0;
  private readonly configDto: Record<string, any>;
  private readonly fps: number;
  private readonly displayHeight: number;
  private readonly fpsCoef = 100 / 60;
  private _engine: ReelsEngine | null = null;
  private _container: Container;

  constructor(
    container: Container,
    configDto: Record<string, any>,
    fps: number,
    displayHeight: number
  ) {
    this._container = container;
    this.configDto = configDto;
    this.fps = fps;
    this.displayHeight = displayHeight;
  }

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

  get spinedReels(): number[][] {
    return getListOfListOfInt(this.configDto, 'reels') as number[][];
  }

  get noWinReels(): number[][] {
    return getListOfListOfInt(this.configDto, 'noWinReels') as number[][];
  }

  get spinSpeed(): number {
    return (
      ((((this.configDto['spinSpeed'] as number) / this.fpsCoef) * this.fps * this.displayHeight) /
        640) *
      this.speedMultiplier
    );
  }

  get collapseSpinSpeed(): number {
    return (
      (((this.configDto['spinSpeed'] as number) / this.fpsCoef) * this.fps * this.displayHeight) /
      640
    );
  }

  get useAnticipation(): boolean {
    return this.configDto['useAnticipation'] as boolean;
  }

  get directions(): number[] {
    return getListOfInt(this.configDto, 'directions') as number[];
  }

  get accelerationDuration(): number {
    return (this.configDto['spinDuration']['accelerationDuration'] as number) / 1000;
  }

  get spinStartDelay(): number {
    return (
      (this.configDto['spinDuration']['spinStartDelay'] as number) / 1000 / this.speedMultiplier
    );
  }

  get spinStopDelay(): number {
    return (
      (this.configDto['spinDuration']['spinStopDelay'] as number) / 1000 / this.speedMultiplier
    );
  }

  get continueDuration(): number {
    return (this.configDto['spinDuration']['continueDuration'] as number) / 1000;
  }

  get noWinDelay(): number {
    return this.speedMultiplier !== 1.0 ? 0.0 : 1.0;
  }

  get blinkDuration(): number {
    return (this.configDto['wins']['blinkTime'] as number) / 1000;
  }

  get blinkIterations(): number {
    return this.configDto['wins']['linesBlink'] as number;
  }

  get singleEntitySpinSpeed(): number {
    const speed =
      ((((this.configDto['spinSpeed'] as number) / this.fpsCoef) * this.fps * this.displayHeight) /
        640) *
      this.speedMultiplier;
    const SingleMaxSpeed =
      ((this.Engine.ReelConfig.symbolSize.y / this.fpsCoef) * this.fps * this.displayHeight) / 640;
    return speed > SingleMaxSpeed ? SingleMaxSpeed : speed;
  }

  get iconWithValuesConfig(): IconWithValuesConfig | null {
    return this.configDto['iconWithValuesParameters']
      ? new IconWithValuesConfig(this.configDto['iconWithValuesParameters'] as Record<string, any>)
      : null;
  }

  get anticipationConfig(): AbstractAnticipationConfig {
    return new AnticipationConfig(
      this.configDto['anticipationParameters'] as Record<string, any>,
      this.fps,
      this.displayHeight
    );
  }
}

export class AnticipationConfig implements AbstractAnticipationConfig {
  public speedMultiplier = 1.0;
  private readonly _configDto: Record<string, any>;
  private readonly _fps: number;
  private readonly _displayHeight: number;
  multiplier = 1.0;

  constructor(configDto: Record<string, any>, fps: number, displayHeight: number) {
    this._configDto = configDto;
    this._fps = fps;
    this._displayHeight = displayHeight;
  }

  get anticipatedSpinSpeed(): number {
    return (
      (((this._configDto['spinSpeed'] as number) * this._fps * this._displayHeight) / 640) *
      this.speedMultiplier
    );
  }

  get slowDownAnticipatedSpinSpeed(): number {
    return (
      ((((this._configDto['spinSpeed'] as number) / 4.0) * this._fps * this._displayHeight) / 640) *
      this.speedMultiplier
    );
  }

  get acceleratedDuration(): number {
    return 0.02;
  }

  get anticipationReels(): number[][] {
    return getListOfListOfInt(this._configDto, 'anticipationReels') as number[][];
  }

  get anticipationIcons(): number[] {
    return getListOfInt(this._configDto, 'anticipationIcons') as number[];
  }

  get minIconsForWin(): number {
    return this._configDto['anticipationMinIconsForWin'][0] as number;
  }

  get minIconsForAnticipation(): number {
    return Array.isArray(this._configDto['minIconsForAnticipation']) &&
      this._configDto['minIconsForAnticipation'].length > 0 &&
      typeof this._configDto['minIconsForAnticipation'][0] === 'number'
      ? this._configDto['minIconsForAnticipation'][0]
      : 2;
  }

  get stopBehaviorReels(): number[][] {
    return getListOfListOfInt(this._configDto, 'stopBehaviorReels') as number[][];
  }

  get stopBehaviorIcons(): number[] {
    return getListOfInt(this._configDto, 'stopBehaviorIcons') as number[];
  }

  get stopBehaviorIconsByPos(): number[] {
    return getListOfInt(this._configDto, 'stopBehaviorIconsByPos') as number[];
  }

  get stopBehaviorConnectedIcons(): number[][] {
    return getListOfListOfInt(this._configDto, 'stopBehaviorConnectedIcons') as number[][];
  }

  get minIconsForStopBehavior(): number[] {
    return getListOfInt(this._configDto, 'stopBehaviorMinIconsForWin') as number[];
  }

  get continueDurationAnticipating(): number {
    return (this._configDto['continueDurationAnticipating'] as number) / 1000;
  }

  get continueDurationNotAnticipating(): number {
    return (this._configDto['continueDurationNotAnticipating'] as number) / 1000;
  }

  get maxSpeed(): number {
    return this._displayHeight * 30;
  }

  minIconsForAnticipationForSymbol(symbol: number): number {
    const ancticipationIndex = this._configDto['anticipationIcons'].indexOf(symbol) ?? 0;
    if (ancticipationIndex === -1) return 2;
    return this._configDto['minIconsForAnticipation'] &&
      (this._configDto['minIconsForAnticipation'] as any[]).length > 0
      ? (this._configDto['minIconsForAnticipation'][ancticipationIndex] as number)
      : 2;
  }

  minIconsForWinForIcon(symbol: number): number {
    const ancticipationIndex = this._configDto['anticipationIcons'].indexOf(symbol) ?? 0;
    if (ancticipationIndex === -1) return 2;
    return this._configDto['anticipationMinIconsForWin'] &&
      (this._configDto['anticipationMinIconsForWin'] as any[]).length > 0
      ? (this._configDto['anticipationMinIconsForWin'][ancticipationIndex] as number)
      : 2;
  }
}

export class CollapsingParameters {
  private readonly _configDto: Record<string, any>;

  constructor(configDto: Record<string, any>) {
    this._configDto = configDto;
  }

  get spinSpeedMultiplier(): number {
    return 1.0;
  }

  get iconFallingStartDelay(): number {
    return this.spinSpeedMultiplier > 1.0
      ? 0.0
      : (this._configDto['iconFallingStartDelay'] as number) / 1000;
  }

  get reelFallingStartDelay(): number {
    return this.spinSpeedMultiplier > 1.0
      ? 0.0
      : (this._configDto['reelFallingStartDelay'] as number) / 1000;
  }

  get iconOutgoingStartDelay(): number {
    return this.spinSpeedMultiplier > 1.0
      ? 0.0
      : (this._configDto['iconOutgoingStartDelay'] as number) / 1000;
  }

  get reelOutgoingStartDelay(): number {
    return this.spinSpeedMultiplier > 1.0
      ? 0.0
      : (this._configDto['reelOutgoingStartDelay'] as number) / 1000;
  }

  get roundFallingStartDelay(): number {
    return this.spinSpeedMultiplier > 1.0
      ? 0.0
      : (this._configDto['roundFallingStartDelay'] as number) / 1000;
  }

  get iconShiftStartDelay(): number {
    return this.spinSpeedMultiplier > 1.0
      ? 0.0
      : (this._configDto['iconShiftStartDelay'] as number) / 1000;
  }
}

export class StaticConfig extends AbstractStaticConfig {
  private readonly _configDto: Record<string, any>;

  constructor(configDto: Record<string, any>) {
    super();
    this._configDto = configDto;
  }

  get spinedReels(): number[][] {
    return getListOfListOfInt(this._configDto, 'reels') as number[][];
  }

  get noWinReels(): number[][] {
    return getListOfListOfInt(this._configDto, 'noWinReels') as number[][];
  }
}

export class IconWithValuesConfig {
  private readonly _configDto: Record<string, any>;

  constructor(configDto: Record<string, any>) {
    this._configDto = configDto;
  }

  get specGroupTypeNames(): string[] {
    return this._configDto.getListOfString('specGroupTypeNames');
  }

  get iconWithValueConfigs(): Map<number, IconWithValueConfig> | null {
    const icons = this._configDto['iconWithValueParameters'] as Record<string, any>;
    if (!icons) {
      return null;
    }
    const result = new Map<number, IconWithValueConfig>();
    for (const key in icons) {
      const value = icons[key];
      const iconWithValue = new IconWithValueConfig(value as Record<string, any>);
      const newKey = parseInt(key as string);
      result.set(newKey, iconWithValue);
    }
    return result;
  }
}

export class IconWithValueConfig {
  private readonly _configDto: Record<string, any>;

  constructor(configDto: Record<string, any>) {
    this._configDto = configDto;
  }

  get shouldBeMultipliedByBet(): boolean {
    return !!this._configDto['shouldBeMultipliedByBet'];
  }

  get useSubTypeForState(): boolean {
    return !!this._configDto['useSubTypeForState'];
  }

  get possibleIconStates(): string[] | null {
    return this._configDto.getListOfString('possibleStates');
  }

  get values(): number[] | null {
    return this._configDto.getListOfDouble('baseValues');
  }
}

export class StagedFreeSpinsCollectConfig {
  private readonly _freeSpinsCollectConfigDto: Record<string, any>;

  constructor(featuresConfigDto: Record<string, any>) {
    this._freeSpinsCollectConfigDto = featuresConfigDto['stagedFreeSpinsCollectConfig'] as Record<
      string,
      any
    >;
  }

  get stageLength(): number[] | null {
    return getListOfInt(this._freeSpinsCollectConfigDto, 'stageLength');
  }

  get stageFreeSpinsCount(): number[] | null {
    return getListOfInt(this._freeSpinsCollectConfigDto, 'stageFreeSpinsCount');
  }

  get stageEndValues(): number[] | null {
    return this._freeSpinsCollectConfigDto.getListOfDouble('stageEndValues');
  }
}

export class StackedReelsStopSlotActionConfig {
  private readonly _configDto: Record<string, any>;

  constructor(featuresConfigDto: Record<string, any>) {
    this._configDto = featuresConfigDto['stackedReelsStopSlotActionConfig'] as Record<string, any>;
  }

  get showStacksHitRate(): number {
    return this._configDto['showStacksHitRate'] as number;
  }

  get accelerateIfWinImpossible(): number {
    return this._configDto['accelerateIfWinImpossible'] as number;
  }

  get setUpDistribution(): number {
    return this._configDto['setUpDistribution'] as number;
  }
}
