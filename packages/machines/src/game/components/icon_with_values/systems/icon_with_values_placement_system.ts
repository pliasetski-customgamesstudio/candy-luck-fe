import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { AbstractIconWithValuesProvider } from '../abstract_icon_with_values_provider';
import { IconValueDescription } from '../icon_value_description';
import { IconWithValuesComponentNames } from '../icon_with_values_component_names';

export class IconWithValuesPlacementSystem extends BaseSystem {
  private _reelIndex: ComponentIndex;
  private _posInReelIndex: ComponentIndex;
  private _drawableIdIndex: ComponentIndex;
  private _enumerationIndex: ComponentIndex;
  private _iconValueDescriptionIndex: ComponentIndex;

  private _iconWithValuesProvider: AbstractIconWithValuesProvider;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    iconWithValuesProvider: AbstractIconWithValuesProvider
  ) {
    super(engine, entityCacheHolder);
    this._iconWithValuesProvider = iconWithValuesProvider;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._posInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    this._drawableIdIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    this._iconValueDescriptionIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueDescription
    );
    return [this._reelIndex, this._posInReelIndex, this._drawableIdIndex, this._enumerationIndex];
  }

  processEntity(entity: Entity): void {
    if (entity.hasComponent(this._iconValueDescriptionIndex)) {
      return;
    }

    const reel: number = entity.get<number>(this._reelIndex);
    const posInReel: number = entity.get(this._posInReelIndex);

    const valueDescription: IconValueDescription | null =
      this._iconWithValuesProvider.getValueDescription(reel, posInReel);
    if (valueDescription) {
      entity.addComponent(IconWithValuesComponentNames.IconValueDescription, valueDescription);
      entity.addComponent(IconWithValuesComponentNames.DirtyIconValue, true);
    }
  }
}
