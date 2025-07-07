import { Vector2 } from '@cgs/syd';
import { BeforeBrakingSystem } from './before_braking_system';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { InternalReelsConfig } from '../internal_reels_config';
import { IconEnumerator } from '../icon_enumerator';
import { BrakingCalculationInfo } from '../entity_components/braking_calculation_info';
import { Entity } from '../entities_engine/entity';
import { SpeedInterpolation } from '../entity_components/speed_interpolation';
import { ComponentNames } from '../entity_components/component_names';

export class BeforeBrakingSystemV2 extends BeforeBrakingSystem {
  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    enumerator: IconEnumerator
  ) {
    super(engine, entityCacheHolder, config, enumerator);
  }

  CalculateSecondPrecisionTime(breakInfo: BrakingCalculationInfo, reel: number): void {
    const y = breakInfo.position.y;

    const skip =
      y -
      Math.floor(y / this.config.symbolSizeByReel[reel].y) * this.config.symbolSizeByReel[reel].y;
    const destination = new Vector2(
      0.0,
      this.config.slotSizeByReel[reel].y - Math.sign(breakInfo.speed.y) * skip
    );
    const linearTime = destination.y / Math.abs(breakInfo.speed.y);
    this.integratedTime[reel] = linearTime / this.integratedDest[reel];
    this.integratedTime[reel] =
      linearTime / this.interpolateSpeedFunc(reel, 1 / this.integratedTime[reel]);
  }

  CalculateSecondPrecisionTimeSingleEntity(
    breakInfo: BrakingCalculationInfo,
    reel: number,
    line: number
  ): void {
    const curLine = Math.floor(breakInfo.position.y) / this.config.symbolSizeByReel[reel].y;
    const diff = line - curLine + 1;
    const y = breakInfo.position.y - this.config.symbolSizeByReel[reel].y * line;
    const skip =
      y -
      Math.floor(y / this.config.symbolSizeByReel[reel].y) * this.config.symbolSizeByReel[reel].y;
    const destination = new Vector2(
      0.0,
      this.config.symbolSizeByReel[reel].y * 3 -
        Math.sign(breakInfo.speed.y) * skip +
        diff * this.config.symbolSizeByReel[reel].y
    );
    const linearTime = destination.y / Math.abs(breakInfo.speed.y);
    this.integratedTime[reel] = linearTime / this.integratedDest[reel];
    this.integratedTime[reel] =
      linearTime / this.interpolateSpeedFunc(reel, 1 / this.integratedTime[reel]);
  }

  processSlotSpinningEntity(entity: Entity): void {
    const breakInfo = entity.get(this.brakingInfoIndex) as BrakingCalculationInfo;
    const reel = entity.get(this.reelIndex) as number;
    const offset = this.config.reelsOffset[reel] as Vector2;
    breakInfo.position.subVector(new Vector2(0.0, offset.y)); // offset for X we apply in ReelsEngine CreateEntites()

    const posInReel = Math.floor(breakInfo.position.y / this.config.symbolSizeByReel[reel].y);

    if (Math.abs(this.integratedTime[reel]) <= 0.0000001)
      this.CalculateSecondPrecisionTime(breakInfo, reel);
    const interpolate = new SpeedInterpolation()
      .withParameters(
        this.integratedTime[reel],
        new Vector2(0.0, breakInfo.speed.y),
        Vector2.Zero,
        Vector2.lerp
      )
      .withTimeFunction(this.config.getStopEasing(reel));
    const enumerationId = entity.get(this.enumerationIndex) as number;
    if (posInReel >= 0 && posInReel < this.config.lineCount - this.config.additionalLines) {
      const speedY = Math.sign(breakInfo.speed.y);
      const finalEnumerationId = enumerationId + this.config.lineCount * speedY;
      this.enumerator.setMappedWinIndex(reel, posInReel, finalEnumerationId);
    }
    this.entityCacheHolder.replaceEntities(reel, posInReel, [entity]);
    entity.addComponent(ComponentNames.PositionInReel, posInReel);
    entity.addComponent(ComponentNames.CalculationReadyFlag, true);
    entity.addComponent(ComponentNames.BrakingInterpolate, interpolate);
    entity.addComponent(
      ComponentNames.FinalPosition,
      new Vector2(breakInfo.position.x, posInReel * this.config.symbolSizeByReel[reel].y + offset.y)
    );

    entity.addComponent(
      ComponentNames.FinalEnumerationIndex,
      enumerationId + this.config.lineCount * Math.sign(breakInfo.speed.y)
    );
    entity.addComponent(ComponentNames.CheckIconIndex, true);
    entity.removeComponent(ComponentNames.BrakingCalculationInfo);
  }

  processSingleSpinningEntity(entity: Entity): void {
    const breakInfo = entity.get(this.brakingInfoIndex) as BrakingCalculationInfo;
    const reel = entity.get(this.reelIndex) as number;
    const line = entity.get(this.lineIndex) as number;
    const offset = this.config.reelsOffset[reel];
    breakInfo.position.subVector(new Vector2(0.0, offset.y)); // offset for X we apply in ReelsEngine CreateEntites()

    const posInReel = line;
    const curPos = Math.floor(breakInfo.position.y / this.config.symbolSizeByReel[reel].y);
    const diff = posInReel - curPos + 1;

    if (Math.abs(this.integratedTime[reel]) <= 0.0000001)
      this.CalculateSecondPrecisionTimeSingleEntity(breakInfo, reel, line);
    const interpolate = new SpeedInterpolation()
      .withParameters(
        this.integratedTime[reel],
        new Vector2(0.0, breakInfo.speed.y),
        Vector2.Zero,
        Vector2.lerp
      )
      .withTimeFunction(this.config.getStopEasing(reel));
    const enumerationId = entity.get(this.enumerationIndex) as number;
    if (posInReel >= 0 && posInReel < this.config.lineCount - this.config.additionalLines) {
      const _speedY = Math.sign(breakInfo.speed.y);
      const finalEnumerationId =
        enumerationId + 3 * Math.sign(breakInfo.speed.y) + 3 * Math.sign(diff);
      this.enumerator.setMappedWinIndex(reel, posInReel, finalEnumerationId);
    }
    this.entityCacheHolder.replaceEntities(reel, posInReel, [entity]);
    entity.addComponent(ComponentNames.PositionInReel, posInReel);
    entity.addComponent(ComponentNames.CalculationReadyFlag, true);
    entity.addComponent(ComponentNames.BrakingInterpolate, interpolate);
    entity.addComponent(
      ComponentNames.FinalPosition,
      new Vector2(breakInfo.position.x, posInReel * this.config.symbolSizeByReel[reel].y + offset.y)
    );

    entity.addComponent(
      ComponentNames.FinalEnumerationIndex,
      enumerationId + 3 * Math.sign(breakInfo.speed.y) + 3 * Math.sign(diff)
    );
    entity.addComponent(ComponentNames.CheckIconIndex, true);
    entity.removeComponent(ComponentNames.BrakingCalculationInfo);
  }
}
