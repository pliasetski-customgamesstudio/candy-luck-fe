import { InterpolateCopyAction, Vector2 } from '@cgs/syd';

import { PositionInterpolateSystem } from './position_interpolate_system';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { InternalReelsConfig } from '../internal_reels_config';
import { Entity } from '../entities_engine/entity';
import { ComponentNames } from '../entity_components/component_names';

export class PositionInterpolateSystemWithCache extends PositionInterpolateSystem {
  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder, config);
  }

  processEntity(entity: Entity): void {
    const positionInterpolate = entity.get(
      this.positionInterpolateIndex
    ) as InterpolateCopyAction<Vector2>;

    if (!positionInterpolate.isDone) {
      if (!this.processedEntities.includes(entity)) {
        this.processedEntities.push(entity);
      }

      positionInterpolate.update(this.currentDeltaTime);
      entity.set(this.positionIndex, positionInterpolate.current);
      const speed = new Vector2(
        0.0,
        -(positionInterpolate.endValue.y - positionInterpolate.startValue.y) /
          positionInterpolate.duration
      );
      this.portalSystem(entity, speed);
    } else {
      let line = Math.round(positionInterpolate.current.y / this.config.symbolSize.y);
      if (line >= this.config.lineCount - this.config.additionalUpLines - 1) {
        line = line - this.config.lineCount - 1;
      }
      if (line <= -this.config.additionalUpLines) {
        line = line + this.config.lineCount - 1;
      }

      entity.set(this.lineIndex, line);
      entity.addComponent(ComponentNames.PositionInReel, line);

      entity.removeComponent(ComponentNames.RelocatedFlag);
      entity.removeComponent(ComponentNames.PositionInterpolate);

      entity.removeComponent(ComponentNames.FinalPosition);
      entity.removeComponent(ComponentNames.AfterBraking);
      entity.removeComponent(ComponentNames.CalculationReadyFlag);
      entity.removeComponent(ComponentNames.FinalEnumerationIndex);
      entity.removeComponent(ComponentNames.BrakingInterpolate);
      entity.removeComponent(ComponentNames.Speed);
      entity.removeComponent(ComponentNames.RelocatedFlag);

      this.entityCacheHolder.replaceEntities(entity.get(this.reelIndex), line, [entity]);

      this.processedEntities.splice(this.processedEntities.indexOf(entity), 1);
    }
  }
}
