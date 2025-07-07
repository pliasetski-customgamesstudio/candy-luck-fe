import { Vector2 } from '@cgs/syd';
import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { InternalReelsConfig } from '../../../../reels_engine/internal_reels_config';
import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { IconWithValuesComponentNames } from '../icon_with_values_component_names';

export class IconWithValuesPortalSystem extends BaseSystem {
  private _config: InternalReelsConfig;
  private _relocatedFlagIndex: ComponentIndex;
  private _positionIndex: ComponentIndex;
  private _speedIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _iconValueDescriptionIndex: ComponentIndex;
  private _iconValueSceneIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._relocatedFlagIndex = this.engine.getComponentIndex(ComponentNames.RelocatedFlag);
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._iconValueDescriptionIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueDescription
    );
    this._iconValueSceneIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueScene
    );
    return [
      this._positionIndex,
      this._speedIndex,
      this._relocatedFlagIndex,
      this._iconValueDescriptionIndex,
      this._iconValueSceneIndex,
    ];
  }

  processEntity(entity: Entity): void {
    const velocity: Vector2 = entity.get(this._speedIndex);
    const position: Vector2 = entity.get<Vector2>(this._positionIndex);
    const reelIndex: number = entity.get<number>(this._reelIndex);
    const offset = this._config.reelsOffset[reelIndex].add(this._config.offset);

    let relocated = 0;

    if (velocity.x > 0 && position.x > this._config.slotSize.x) {
      relocated = 1;
    } else if (velocity.x < 0 && position.x < -this._config.symbolSize.x) {
      relocated = -1;
    }

    if (velocity.y > 0 && position.y > this._config.slotSize.y + offset.y) {
      relocated = 1;
    } else if (velocity.y < 0 && position.y < offset.y) {
      relocated = -1;
    }

    if (relocated !== 0) {
      entity.removeComponent(IconWithValuesComponentNames.IconValueDescription);
      entity.removeComponent(IconWithValuesComponentNames.IconValueScene);
    }
  }
}
