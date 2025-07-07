import { BaseSystem } from './base_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export enum UpdateEntityCacheMode {
  AddAsEquitable,
  AddAsForeground,
  Replace,
  Skip,
}

export class UpdateEntityCacheSystem extends BaseSystem {
  private _indexesForFilter: ComponentIndex[];
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _updateAnimationEntityCacheMode: UpdateEntityCacheMode;
  private _updateSoundEntityCacheMode: UpdateEntityCacheMode;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    indexesForFilter: ComponentIndex[],
    updateAnimationEntityCacheMode: UpdateEntityCacheMode,
    updateSoundEntityCacheMode: UpdateEntityCacheMode
  ) {
    super(engine, entityCacheHolder);
    this._indexesForFilter = indexesForFilter;
    this._reelIndex = engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = engine.getComponentIndex(ComponentNames.LineIndex);
    this._updateAnimationEntityCacheMode = updateAnimationEntityCacheMode;
    this._updateSoundEntityCacheMode = updateSoundEntityCacheMode;
  }

  public processEntity(entity: Entity): void {
    const reel = entity.get<number>(this._reelIndex) as number;
    const line = entity.get<number>(this._lineIndex) as number;

    if (!this.entityCacheHolder.getAnimationEntities(reel, line, true).includes(entity)) {
      switch (this._updateAnimationEntityCacheMode) {
        case UpdateEntityCacheMode.AddAsEquitable:
          this.entityCacheHolder.addAnimationEntities(reel, line, false, [entity]);
          break;
        case UpdateEntityCacheMode.AddAsForeground:
          this.entityCacheHolder.addAnimationEntities(reel, line, true, [entity]);
          break;
        case UpdateEntityCacheMode.Replace:
          this.entityCacheHolder.replaceAnimationEntities(reel, line, [entity]);
          break;
        case UpdateEntityCacheMode.Skip:
        default:
      }

      switch (this._updateSoundEntityCacheMode) {
        case UpdateEntityCacheMode.AddAsEquitable:
          this.entityCacheHolder.addSoundEntities(reel, line, false, [entity]);
          break;
        case UpdateEntityCacheMode.AddAsForeground:
          this.entityCacheHolder.addSoundEntities(reel, line, true, [entity]);
          break;
        case UpdateEntityCacheMode.Replace:
          this.entityCacheHolder.replaceSoundEntities(reel, line, [entity]);
          break;
        case UpdateEntityCacheMode.Skip:
        default:
      }
    }
    super.processEntity(entity);
  }

  public getIndexesForFilter(): ComponentIndex[] {
    return this._indexesForFilter;
  }
}
