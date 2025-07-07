import { Vector2 } from '@cgs/syd';

import { BaseSystem } from './base_system';
import { InternalReelsConfig } from '../internal_reels_config';
import { IconEnumerator } from '../icon_enumerator';
import { IntegrationHelper } from '../utils/integration_helper';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { SpeedInterpolation } from '../entity_components/speed_interpolation';
import { ComponentNames } from '../entity_components/component_names';
import { BrakingCalculationInfo } from '../entity_components/braking_calculation_info';
import { Entity } from '../entities_engine/entity';

export class BeforeBrakingSystem extends BaseSystem {
  static readonly IntegrationPrecision: number = 0.0001;
  private _config: InternalReelsConfig;
  get config(): InternalReelsConfig {
    return this._config;
  }
  private readonly _enumerator: IconEnumerator;
  get enumerator(): IconEnumerator {
    return this._enumerator;
  }
  private readonly _integrationHelper: IntegrationHelper = new IntegrationHelper();
  private _integratedTime: number[];
  get integratedTime(): number[] {
    return this._integratedTime;
  }
  private _integratedDest: number[];
  get integratedDest(): number[] {
    return this._integratedDest;
  }
  private _brakingInfoIndex: ComponentIndex;
  get brakingInfoIndex(): ComponentIndex {
    return this._brakingInfoIndex;
  }
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _lineIndex: ComponentIndex;
  get lineIndex(): ComponentIndex {
    return this._lineIndex;
  }
  private _enumerationIndex: ComponentIndex;
  get enumerationIndex(): ComponentIndex {
    return this._enumerationIndex;
  }
  private _singleSpinningIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    _enumerator: IconEnumerator
  ) {
    super(engine, entityCacheHolder);
    this._enumerator = _enumerator;
    this._config = config;
    this._integratedTime = new Array<number>(this._config.reelCount);
    this._integratedDest = new Array<number>(this._config.reelCount);
    for (let reel = 0; reel < this._config.reelCount; ++reel) {
      const interpolator = new SpeedInterpolation()
        .withParameters(1.0, Vector2.One, Vector2.Zero, Vector2.lerp)
        .withTimeFunction(this._config.getStopEasing(reel));
      this._integratedDest[reel] = this._integrationHelper.integrate(
        interpolator,
        BeforeBrakingSystem.IntegrationPrecision
      );
    }
  }

  updateConfig(config: InternalReelsConfig): void {
    this._config = config;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._brakingInfoIndex = this.engine.getComponentIndex(ComponentNames.BrakingCalculationInfo);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    this._singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    return [this._brakingInfoIndex, this._reelIndex, this._enumerationIndex];
  }

  updateImpl(dt: number): void {
    if (this.entities.list.length > 0)
      this._integratedTime.fill(0.0, 0, this._integratedTime.length);
    super.updateImpl(dt);
  }

  CalculateSecondPrecisionTime(breakInfo: BrakingCalculationInfo, reel: number): void {
    const y = breakInfo.position.y;
    const skip = Math.floor(y - (y / this._config.symbolSize.y) * this._config.symbolSize.y);
    const destination = new Vector2(
      0.0,
      this._config.slotSize.y - Math.sign(breakInfo.speed.y) * skip
    );
    const linearTime = destination.y / Math.abs(breakInfo.speed.y);
    this._integratedTime[reel] = linearTime / this._integratedDest[reel];
    this._integratedTime[reel] =
      linearTime / this.interpolateSpeedFunc(reel, 1 / this._integratedTime[reel]);
  }

  CalculateSecondPrecisionTimeSingleEntity(
    breakInfo: BrakingCalculationInfo,
    reel: number,
    line: number
  ): void {
    const curLine = Math.floor(breakInfo.position.y / this._config.symbolSize.y);
    const diff = line - curLine + 1;
    const y = breakInfo.position.y - this._config.symbolSize.y * line;
    const skip = Math.floor(y - (y / this._config.symbolSize.y) * this._config.symbolSize.y);
    const destination = new Vector2(
      0.0,
      this._config.symbolSize.y * 3 -
        Math.sign(breakInfo.speed.y) * skip +
        diff * this._config.symbolSize.y
    );
    const linearTime = destination.y / Math.abs(breakInfo.speed.y);
    this._integratedTime[reel] = linearTime / this._integratedDest[reel];
    this._integratedTime[reel] =
      linearTime / this.interpolateSpeedFunc(reel, 1 / this._integratedTime[reel]);
  }

  interpolateSpeedFunc(reel: number, precision: number): number {
    const normalInterpolator = new SpeedInterpolation()
      .withParameters(1.0, Vector2.One, Vector2.Zero, Vector2.lerp)
      .withTimeFunction(this._config.getStopEasing(reel));
    return this._integrationHelper.integrate(normalInterpolator, precision);
  }

  processEntity(entity: Entity): void {
    let isSingleSpinningEntity = false;
    if (entity.hasComponent(this._singleSpinningIndex)) {
      isSingleSpinningEntity = entity.get(this._singleSpinningIndex);
    }

    if (isSingleSpinningEntity) {
      this.processSingleSpinningEntity(entity);
    } else {
      this.processSlotSpinningEntity(entity);
    }
  }

  processSlotSpinningEntity(entity: Entity): void {
    const breakInfo = entity.get(this._brakingInfoIndex) as BrakingCalculationInfo;
    const reel = entity.get<number>(this._reelIndex) as number;
    const offset = this._config.reelsOffset[reel];
    breakInfo.position.subtract(new Vector2(0.0, offset.y)); // offset for X we apply in ReelsEngine CreateEntites()

    const posInReel = Math.floor(breakInfo.position.y / this._config.symbolSize.y);

    if (Math.abs(this._integratedTime[reel]) <= 0.0000001)
      this.CalculateSecondPrecisionTime(breakInfo, reel);
    const interpolate = new SpeedInterpolation()
      .withParameters(
        this._integratedTime[reel],
        new Vector2(0.0, breakInfo.speed.y),
        Vector2.Zero,
        Vector2.lerp
      )
      .withTimeFunction(this._config.getStopEasing(reel));
    const enumerationId = entity.get(this._enumerationIndex) as number;
    if (posInReel >= 0 && posInReel < this._config.lineCount - this._config.additionalLines) {
      const speedY = Math.sign(breakInfo.speed.y);
      const finalEnumerationId = enumerationId + this._config.lineCount * speedY;
      this._enumerator.setMappedWinIndex(reel, posInReel, finalEnumerationId);
    }
    this.entityCacheHolder.replaceEntities(reel, posInReel, [entity]);
    entity.addComponent(ComponentNames.PositionInReel, posInReel);
    entity.addComponent(ComponentNames.CalculationReadyFlag, true);
    entity.addComponent(ComponentNames.BrakingInterpolate, interpolate);
    entity.addComponent(
      ComponentNames.FinalPosition,
      new Vector2(breakInfo.position.x, posInReel * this._config.symbolSize.y + offset.y)
    );

    entity.addComponent(
      ComponentNames.FinalEnumerationIndex,
      enumerationId + this._config.lineCount * Math.sign(breakInfo.speed.y)
    );
    entity.addComponent(ComponentNames.CheckIconIndex, true);
    entity.removeComponent(ComponentNames.BrakingCalculationInfo);
  }

  processSingleSpinningEntity(entity: Entity): void {
    const breakInfo = entity.get(this._brakingInfoIndex) as BrakingCalculationInfo;
    const reel = entity.get<number>(this._reelIndex) as number;
    const line = entity.get<number>(this._lineIndex) as number;
    const offset = this._config.reelsOffset[reel];
    breakInfo.position.subtract(new Vector2(0.0, offset.y)); // offset for X we apply in ReelsEngine CreateEntites()

    const posInReel = line;
    const curPos = Math.floor(breakInfo.position.y / this._config.symbolSize.y);
    const diff = posInReel - curPos + 1;

    if (Math.abs(this._integratedTime[reel]) <= 0.0000001)
      this.CalculateSecondPrecisionTimeSingleEntity(breakInfo, reel, line);
    const interpolate = new SpeedInterpolation()
      .withParameters(
        this._integratedTime[reel],
        new Vector2(0.0, breakInfo.speed.y),
        Vector2.Zero,
        Vector2.lerp
      )
      .withTimeFunction(this._config.getStopEasing(reel));
    const enumerationId = entity.get(this._enumerationIndex) as number;
    if (posInReel >= 0 && posInReel < this._config.lineCount - this._config.additionalLines) {
      const _speedY = Math.sign(breakInfo.speed.y);
      const finalEnumerationId =
        enumerationId + (3 * Math.sign(breakInfo.speed.y) + 3 * Math.sign(diff));
      this._enumerator.setMappedWinIndex(reel, posInReel, finalEnumerationId);
    }
    this.entityCacheHolder.replaceEntities(reel, posInReel, [entity]);
    entity.addComponent(ComponentNames.PositionInReel, posInReel);
    entity.addComponent(ComponentNames.CalculationReadyFlag, true);
    entity.addComponent(ComponentNames.BrakingInterpolate, interpolate);
    entity.addComponent(
      ComponentNames.FinalPosition,
      new Vector2(breakInfo.position.x, posInReel * this._config.symbolSize.y + offset.y)
    );

    entity.addComponent(
      ComponentNames.FinalEnumerationIndex,
      enumerationId + 3 * Math.sign(breakInfo.speed.y) + 3 * Math.sign(diff)
    );
    entity.addComponent(ComponentNames.CheckIconIndex, true);
    entity.removeComponent(ComponentNames.BrakingCalculationInfo);
  }
}
