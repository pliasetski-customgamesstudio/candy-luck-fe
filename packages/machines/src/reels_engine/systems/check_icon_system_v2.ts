import { Vector2 } from '@cgs/syd';
import { CheckIconSystem } from './check_icon_system';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { IconEnumerator } from '../icon_enumerator';
import { InternalReelsConfig } from '../internal_reels_config';
import { Entity } from '../entities_engine/entity';
import { ComponentNames } from '../entity_components/component_names';

export class CheckIconSystemV2 extends CheckIconSystem {
  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    enumerator: IconEnumerator,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder, enumerator, config);
  }

  processEntity(entity: Entity): void {
    const reel: number = entity.get(this.reelIndex) as number;
    const enumerationId: number = entity.get(this.enumerationIndex) as number;
    const pos = entity.get<Vector2>(this.positionIndex) as Vector2;
    const velocity = entity.get(this.velocityIndex) as Vector2;
    const _offset = this.config.reelsOffset[reel].add(this.config.offset);

    if (velocity.y > 0 && pos.y < -this.config.symbolSizeByReel[reel].y) {
      const drawableId = this.enumerator.getNext(reel, enumerationId);
      entity.set(this.drawableIdIndex, drawableId);
    } else if (
      velocity.y < 0 &&
      pos.y > this.config.slotSizeByReel[reel].y + this.config.symbolSizeByReel[reel].y
    ) {
      const drawableId = this.enumerator.getNext(reel, enumerationId);
      entity.set(this.drawableIdIndex, drawableId);
    }

    entity.removeComponent(ComponentNames.CheckIconIndex);
  }
}
