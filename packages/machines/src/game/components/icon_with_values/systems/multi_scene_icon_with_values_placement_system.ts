import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { MultiSceneIconWithValuesProvider } from '../multi_scene_icon_with_values_provider';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { IconWithValuesComponentNames } from '../icon_with_values_component_names';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { MultiSceneIconValueDescription } from '../multi_scene_icon_value_description';

export class MultiSceneIconWithValuesPlacementSystem extends BaseSystem {
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _posInReelIndex: ComponentIndex;
  get posInReelIndex(): ComponentIndex {
    return this._posInReelIndex;
  }
  private _drawableIdIndex: ComponentIndex;
  get drawableIdIndex(): ComponentIndex {
    return this._drawableIdIndex;
  }
  private _enumerationIndex: ComponentIndex;
  get enumerationIndex(): ComponentIndex {
    return this._enumerationIndex;
  }
  private _iconValueDescriptionIndex: ComponentIndex;
  get iconValueDescriptionIndex(): ComponentIndex {
    return this._iconValueDescriptionIndex;
  }
  private _relocatedFlagIndex: ComponentIndex;
  get relocatedFlagIndex(): ComponentIndex {
    return this._relocatedFlagIndex;
  }
  private _accelerationFlagIndex: ComponentIndex;
  get accelerationFlagIndex(): ComponentIndex {
    return this._accelerationFlagIndex;
  }
  private _speedFlagIndex: ComponentIndex;
  get speedFlagIndex(): ComponentIndex {
    return this._speedFlagIndex;
  }

  private _iconPriceComponent: MultiSceneIconWithValuesProvider;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    iconPriceComponent: MultiSceneIconWithValuesProvider
  ) {
    super(engine, entityCacheHolder);
    this._iconPriceComponent = iconPriceComponent;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._posInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    this._drawableIdIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    this._relocatedFlagIndex = this.engine.getComponentIndex(ComponentNames.RelocatedFlag);
    this._accelerationFlagIndex = this.engine.getComponentIndex(
      ComponentNames.AccelerationInterpolate
    );
    this._iconValueDescriptionIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueDescription
    );
    this._speedFlagIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    return [
      this._relocatedFlagIndex,
      this._reelIndex,
      this._drawableIdIndex,
      this._enumerationIndex,
    ];
  }

  processEntity(entity: Entity): void {
    const relocated = entity.get(this._relocatedFlagIndex);
    if (relocated === 0) return;
    const reel = entity.get<number>(this._reelIndex);
    if (entity.hasComponent(this._posInReelIndex)) {
      const posInReel = entity.get<number>(this._posInReelIndex);

      const valueDescription: MultiSceneIconValueDescription | null =
        this._iconPriceComponent.getValueDescription(reel, posInReel);
      if (valueDescription) {
        entity.addComponent(ComponentNames.IconValue, valueDescription);
        entity.addComponent(ComponentNames.NeedUpdate, true);
      } else {
        if (
          entity.hasComponent(this._speedFlagIndex) &&
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconNode))
        ) {
          const drawId = entity.get<number>(this._drawableIdIndex);
          const valueDescriptionFake: MultiSceneIconValueDescription | null =
            this._iconPriceComponent.getFakeValueDescription(reel, -1, drawId);
          if (valueDescriptionFake) {
            entity.addComponent(ComponentNames.IconValue, valueDescriptionFake);
            entity.addComponent(ComponentNames.NeedUpdate, true);
          }
        }
      }
    } else {
      if (
        entity.hasComponent(this._speedFlagIndex) &&
        entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconNode))
      ) {
        const drawId = entity.get<number>(this._drawableIdIndex);
        const valueDescription: MultiSceneIconValueDescription | null =
          this._iconPriceComponent.getFakeValueDescription(reel, -1, drawId);
        if (valueDescription) {
          entity.addComponent(ComponentNames.IconValue, valueDescription);
          entity.addComponent(ComponentNames.NeedUpdate, true);
        }
      }
    }
  }
}
