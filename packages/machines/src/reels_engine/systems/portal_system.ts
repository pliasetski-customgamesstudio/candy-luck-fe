import { BaseSystem } from './base_system';
import { Vector2 } from '@cgs/syd';
import { InternalReelsConfig } from '../internal_reels_config';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export class PortalSystem extends BaseSystem {
  private _config: InternalReelsConfig;
  get config(): InternalReelsConfig {
    return this._config;
  }
  protected _positionIndex: ComponentIndex;
  get positionIndex(): ComponentIndex {
    return this._positionIndex;
  }
  private _velocityIndex: ComponentIndex;
  get velocityIndex(): ComponentIndex {
    return this._velocityIndex;
  }
  private _relocatedFlagIndex: ComponentIndex;
  get relocatedFlagIndex(): ComponentIndex {
    return this._relocatedFlagIndex;
  }
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _lineIndex: ComponentIndex;
  get lineIndex(): ComponentIndex {
    return this._lineIndex;
  }
  private _removeIndex: ComponentIndex;
  get removeIndex(): ComponentIndex {
    return this._removeIndex;
  }
  private _singleSpinningIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
  }

  updateConfig(config: InternalReelsConfig): void {
    this._config = config;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    this._singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._velocityIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._relocatedFlagIndex = this.engine.getComponentIndex(ComponentNames.RelocatedFlag);
    this._removeIndex = this.engine.getComponentIndex(ComponentNames.RemoveEntity);
    return [this._positionIndex, this._velocityIndex];
  }

  processEntity(entity: Entity): void {
    let isSingleSpinningEntity = false;
    if (entity.hasComponent(this._singleSpinningIndex)) {
      isSingleSpinningEntity = entity.get(this._singleSpinningIndex);
    }

    if (isSingleSpinningEntity) {
      this.processSingleSpinningEntity(entity);
    } else {
      this.processSlotSpinningEntity(entity);
    }
  }

  processSlotSpinningEntity(entity: Entity): void {
    const pos = entity.get<Vector2>(this._positionIndex) as Vector2;
    const velocity = entity.get(this._velocityIndex) as Vector2;
    const reelIndex = entity.get<number>(this._reelIndex) as number;
    const offset = this._config.reelsOffset[reelIndex].add(this._config.offset);

    let relocated = 0;
    if (velocity.x > 0 && pos.x > this._config.slotSize.x) {
      pos.x -= this._config.slotSize.x + this._config.symbolSize.x;
      relocated = 1;
    } else if (velocity.x < 0 && pos.x < this._config.symbolSize.x) {
      pos.x += this._config.slotSize.x + this._config.symbolSize.x;
      relocated = -1;
    }

    if (velocity.y > 0 && pos.y > this._config.slotSize.y + offset.y) {
      pos.y -= this._config.slotSize.y;
      relocated = 1;
    } else if (velocity.y < 0 && pos.y < offset.y) {
      pos.y += this._config.slotSize.y;
      relocated = -1;
    }
    entity.set(this._relocatedFlagIndex, relocated);
  }

  processSingleSpinningEntity(entity: Entity): void {
    const position = entity.get<Vector2>(this._positionIndex) as Vector2;
    const velocity = entity.get(this._velocityIndex) as Vector2;
    const reelIndex = entity.get<number>(this._reelIndex) as number;
    const lineIndex = entity.get<number>(this._lineIndex) as number;
    const offset = this._config.reelsOffset[reelIndex].add(this._config.offset);

    let relocated = 0;
    const lineDiff = this._config.lineCount - lineIndex;
    if (velocity.y > 0 && position.y > this._config.symbolSize.y * (lineIndex + 1)) {
      position.y -= this._config.symbolSize.y * 2;
      relocated = 1;
    }

    entity.set(this._relocatedFlagIndex, relocated);
    entity.set(this._positionIndex, position);
  }
}
