import { Vector2 } from '@cgs/syd';
import { AbstractSystem } from '../entities_engine/abstract_system';
import { InternalReelsConfig } from '../internal_reels_config';
import { ComponentIndex } from '../entities_engine/component_index';
import { Entity } from '../entities_engine/entity';
import { ListSet } from '../utils/list_set';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';

export class EntityRemovalSystem extends AbstractSystem {
  private _config: InternalReelsConfig;
  private _positionIndex: ComponentIndex;
  private _speedIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _markerIndex: ComponentIndex;
  private _entities: ListSet<Entity>;

  constructor(engine: EntitiesEngine, config: InternalReelsConfig, marker: string) {
    super(engine);
    this._config = config;
    const filter = engine.getFilterByIndex(this._getIndexesForFilter(marker));
    this._entities = engine.getEntities(filter);
  }

  private _getIndexesForFilter(marker: string): ComponentIndex[] {
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._markerIndex = this.engine.getComponentIndex(marker);
    return [this._positionIndex, this._speedIndex, this._markerIndex];
  }

  public updateImpl(_dt: number): void {
    for (const entity of this._entities.list) {
      const position = entity.get<Vector2>(this._positionIndex);
      const reelIndex = entity.get<number>(this._reelIndex);
      if (
        position.y >
          this._config.slotSize.y + this._config.reelsOffset[reelIndex].y + this._config.offset.y ||
        position.y < this._config.offset.y
      ) {
        entity.unregister();
      }
    }
  }
}
