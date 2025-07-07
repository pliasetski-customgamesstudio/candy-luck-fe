import { ListSet } from '../utils/list_set';
import { AbstractSystem } from '../entities_engine/abstract_system';
import { Entity } from '../entities_engine/entity';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentIndex } from '../entities_engine/component_index';

export abstract class BaseSystem extends AbstractSystem {
  private _entities: ListSet<Entity>;
  public get entities(): ListSet<Entity> {
    return this._entities;
  }
  protected entityCacheHolder: EntityCacheHolder;

  constructor(engine: EntitiesEngine, entityCacheHolder: EntityCacheHolder) {
    super(engine);
    this.entityCacheHolder = entityCacheHolder;
  }

  public withInitialize(): this {
    const filter = this.engine.getFilterByIndex(this.getIndexesForFilter());
    this._entities = this.engine.getEntities(filter);
    return this;
  }

  public updateImpl(_dt: number): void {
    const entities = this._entities.list;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      this.processEntity(entity);
    }
    // entities.forEach((entity) =>this.processEntity(entity));
  }

  public abstract getIndexesForFilter(): ComponentIndex[];

  public processEntity(_entity: Entity): void {}
}
