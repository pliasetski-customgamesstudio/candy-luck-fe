import { Vector2 } from '@cgs/syd';
import { BaseSystem } from './base_system';
import { InternalReelsConfig } from '../internal_reels_config';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { Entity } from '../entities_engine/entity';
import { ComponentNames } from '../entity_components/component_names';

export class VisibilityRestoreSystem extends BaseSystem {
  private _config: InternalReelsConfig;
  private _positionIndex: ComponentIndex;
  private _visibleIndex: ComponentIndex;
  private _speedIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _markerIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
  }

  public processEntity(entity: Entity): void {
    const visible: boolean = entity.get(this._visibleIndex);
    const position: Vector2 = entity.get<Vector2>(this._positionIndex);
    const reelIndex: number = entity.get<number>(this._reelIndex);
    if (
      (visible === false &&
        position.y >
          this._config.slotSize.y +
            this._config.reelsOffset[reelIndex].y +
            this._config.offset.y) ||
      (visible === false && position.y < this._config.offset.y)
    ) {
      entity.set(this._visibleIndex, true);
    }
  }

  private _getIndexesForFilter(marker: string): ComponentIndex[] {
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._markerIndex = this.engine.getComponentIndex(marker);
    return [this._positionIndex, this._speedIndex, this._markerIndex];
  }

  public getIndexesForFilter(): ComponentIndex[] {
    this._visibleIndex = this.engine.getComponentIndex(ComponentNames.Visible);
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    return [this._visibleIndex, this._positionIndex];
  }
}
