import { BaseSystem } from './base_system';
import { Vector2 } from '@cgs/syd';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export class MovementSystem extends BaseSystem {
  positionIndex: ComponentIndex;
  speedIndex: ComponentIndex;

  constructor(engine: EntitiesEngine, entityCacheHolder: EntityCacheHolder) {
    super(engine, entityCacheHolder);
  }

  getIndexesForFilter(): ComponentIndex[] {
    this.positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this.speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    return [this.positionIndex, this.speedIndex];
  }

  processEntity(entity: Entity): void {
    const pos = entity.get<Vector2>(this.positionIndex);
    const speed = entity.get<Vector2>(this.speedIndex);
    pos.x += speed.x;
    pos.y += speed.y;
    entity.set(this.positionIndex, pos);
  }
}
