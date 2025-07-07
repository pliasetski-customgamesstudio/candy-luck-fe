import { Vector2 } from '@cgs/syd';
import { PortalSystem } from './portal_system';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { InternalReelsConfig } from '../internal_reels_config';
import { Entity } from '../entities_engine/entity';

export class PortalSystemV2 extends PortalSystem {
  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder, config);
  }

  processSlotSpinningEntity(entity: Entity): void {
    const pos = entity.get<Vector2>(this.positionIndex) as Vector2;
    const velocity = entity.get(this.velocityIndex) as Vector2;
    const reelIndex = entity.get(super.reelIndex) as number;
    const offset = this.config.reelsOffset[reelIndex].add(this.config.offsetByReel[reelIndex]);

    let relocated = 0;
    if (velocity.x > 0 && pos.x > this.config.slotSizeByReel[reelIndex].x) {
      pos.x -= this.config.slotSizeByReel[reelIndex].x + this.config.symbolSizeByReel[reelIndex].x;
      relocated = 1;
    } else if (velocity.x < 0 && pos.x < this.config.symbolSizeByReel[reelIndex].x) {
      pos.x += this.config.slotSizeByReel[reelIndex].x + this.config.symbolSizeByReel[reelIndex].x;
      relocated = -1;
    }

    if (velocity.y > 0 && pos.y > this.config.slotSizeByReel[reelIndex].y + offset.y) {
      pos.y -= this.config.slotSizeByReel[reelIndex].y;
      relocated = 1;
    } else if (velocity.y < 0 && pos.y < offset.y) {
      pos.y += this.config.slotSizeByReel[reelIndex].y;
      relocated = -1;
    }

    if (relocated !== 0 && entity.hasComponent(this.removeIndex)) {
      entity.unregister();
    } else {
      entity.set(this.relocatedFlagIndex, relocated);
    }
  }

  processSingleSpinningEntity(entity: Entity): void {
    const position = entity.get<Vector2>(this.positionIndex) as Vector2;
    const velocity = entity.get(this.velocityIndex) as Vector2;
    const reelIndex = entity.get(super.reelIndex) as number;
    const lineIndex = entity.get(super.lineIndex) as number;
    const offset = this.config.reelsOffset[reelIndex];

    let relocated = 0;
    const lineDiff = this.config.lineCount - lineIndex;
    if (
      velocity.y > 0 &&
      position.y > this.config.symbolSizeByReel[reelIndex].y * (lineIndex + 1) + offset.y
    ) {
      position.y -= this.config.symbolSizeByReel[reelIndex].y * 2;
      relocated = 1;
    }

    entity.set(this.relocatedFlagIndex, relocated);
    entity.set(this.positionIndex, position);
  }
}
