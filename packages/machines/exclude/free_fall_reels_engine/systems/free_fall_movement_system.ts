import { Vector2 } from 'syd';
import {
  MovementSystem,
  EntitiesEngine,
  EntityCacheHolder,
  Entity,
} from 'machines/src/reels_engine_library';

class FreeFallMovementSystem extends MovementSystem {
  constructor(engine: EntitiesEngine, entityCacheHolder: EntityCacheHolder) {
    super(engine, entityCacheHolder);
  }

  processEntity(entity: Entity): void {
    const position: Vector2 = entity.get(positionIndex);
    const velocity: Vector2 = entity.get(speedIndex);

    position.x += velocity.x;
    position.y += velocity.y;
    entity.set(positionIndex, position);
  }
}
