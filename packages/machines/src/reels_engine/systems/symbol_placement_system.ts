import { BaseSystem } from './base_system';
import { InternalReelsConfig } from '../internal_reels_config';
import { IconEnumerator } from '../icon_enumerator';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';
import { LongIconEnumerator } from '../long_icon_enumerator';
import { LongStoppingIconEnumerator } from '../long_stopping_icons_enumerator';

export class SymbolPlacementSystem extends BaseSystem {
  private readonly _config: InternalReelsConfig;
  get config(): InternalReelsConfig {
    return this._config;
  }
  private readonly _enumerator: IconEnumerator;
  get enumerator(): IconEnumerator {
    return this._enumerator;
  }
  private _relocatedFlagIndex: ComponentIndex;
  get relocatedFlagIndex(): ComponentIndex {
    return this._relocatedFlagIndex;
  }
  private _drawableIndex: ComponentIndex;
  get drawableIndex(): ComponentIndex {
    return this._drawableIndex;
  }
  private _enumerationIndex: ComponentIndex;
  get enumerationIndex(): ComponentIndex {
    return this._enumerationIndex;
  }
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _singleSpinningIndex: ComponentIndex;
  get singleSpinningIndex(): ComponentIndex {
    return this._singleSpinningIndex;
  }

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    enumerator: IconEnumerator
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
    this._enumerator = enumerator;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._relocatedFlagIndex = this.engine.getComponentIndex(ComponentNames.RelocatedFlag);
    this._drawableIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    this._singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    return [this._relocatedFlagIndex, this._drawableIndex, this._enumerationIndex, this._reelIndex];
  }

  processEntity(entity: Entity): void {
    const relocated: number = entity.get(this._relocatedFlagIndex);
    if (relocated !== 0) {
      const reel: number = entity.get<number>(this._reelIndex);
      let drawableId: number = entity.get(this._drawableIndex);
      let enumerationId: number = entity.get(this._enumerationIndex);
      const singleSpinningIndex: boolean = entity.get(this._singleSpinningIndex);
      const enumerationStep: number = singleSpinningIndex ? 3 : this._config.lineCount;

      if (relocated > 0) {
        enumerationId += enumerationStep;
      } else if (relocated < 0) {
        enumerationId -= enumerationStep;
      }
      drawableId = this._enumerator.getNext(reel, enumerationId) as number;

      if (this._enumerator instanceof LongIconEnumerator) {
        const longIconEnumerator = this._enumerator as LongIconEnumerator;
        longIconEnumerator.mapSpinedLongIcons(reel, enumerationId, relocated, drawableId);
      }
      if (this._enumerator instanceof LongStoppingIconEnumerator) {
        const longIconEnumerator = this._enumerator as LongStoppingIconEnumerator;
        longIconEnumerator.mapSpinedLongIcons(reel, enumerationId, relocated, drawableId);
      }

      entity.set(this._enumerationIndex, enumerationId);
      entity.set(this._drawableIndex, drawableId);
    }
  }
}
