import { BaseSystem } from './base_system';
import { Vector2 } from '@cgs/syd';
import { InternalReelsConfig } from '../internal_reels_config';
import { ComponentIndex } from '../entities_engine/component_index';
import { IconEnumerator } from '../icon_enumerator';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export class CheckIconSystem extends BaseSystem {
  private _config: InternalReelsConfig;
  get config(): InternalReelsConfig {
    return this._config;
  }
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _enumerationIndex: ComponentIndex;
  get enumerationIndex(): ComponentIndex {
    return this._enumerationIndex;
  }
  private _checkIconIndex: ComponentIndex;
  private _drawableIdIndex: ComponentIndex;
  get drawableIdIndex(): ComponentIndex {
    return this._drawableIdIndex;
  }
  private _positionIndex: ComponentIndex;
  get positionIndex(): ComponentIndex {
    return this._positionIndex;
  }
  private _velocityIndex: ComponentIndex;
  get velocityIndex(): ComponentIndex {
    return this._velocityIndex;
  }
  private readonly _enumerator: IconEnumerator;
  get enumerator(): IconEnumerator {
    return this._enumerator;
  }

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    enumerator: IconEnumerator,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder);
    this._enumerator = enumerator;
    this._config = config;
  }

  updateConfig(config: InternalReelsConfig): void {
    this._config = config;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._checkIconIndex = this.engine.getComponentIndex(ComponentNames.CheckIconIndex);
    this._drawableIdIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._velocityIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    return [this._checkIconIndex];
  }

  processEntity(entity: Entity): void {
    const reel: number = entity.get<number>(this._reelIndex);
    const enumerationId: number = entity.get(this._enumerationIndex);
    const pos = entity.get<Vector2>(this._positionIndex);
    const velocity = entity.get<Vector2>(this._velocityIndex);
    const _offset = this._config.reelsOffset[reel].add(this._config.offset);

    if (velocity.y > 0 && pos.y < -this._config.symbolSize.y) {
      const drawableId = this._enumerator.getNext(reel, enumerationId);
      entity.set(this._drawableIdIndex, drawableId);
    } else if (velocity.y < 0 && pos.y > this._config.slotSize.y + this._config.symbolSize.y) {
      const drawableId = this._enumerator.getNext(reel, enumerationId);
      entity.set(this._drawableIdIndex, drawableId);
    }

    entity.removeComponent(ComponentNames.CheckIconIndex);
  }
}
