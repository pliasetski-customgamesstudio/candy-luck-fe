import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { AbstractIconStopbehaviorProvider } from '../abstract_icon_stop_behavior_provider';
import { IconStopbehaviorComponentNames } from '../icon_stop_behavior_component_names';
import { IconStopbehaviorDescription } from '../icon_stop_behavior_description';
import { Vector2 } from '@cgs/syd';

export class IconStopbehaviorPlacementSystem extends BaseSystem {
  private _reelIndex: ComponentIndex;
  private _posInReelIndex: ComponentIndex;
  private _drawableIdIndex: ComponentIndex;
  private _enumerationIndex: ComponentIndex;
  private _speedIndex: ComponentIndex;
  private _IconStopbehaviorDescriptionIndex: ComponentIndex;

  private _IconStopbehaviorProvider: AbstractIconStopbehaviorProvider;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    IconStopbehaviorProvider: AbstractIconStopbehaviorProvider
  ) {
    super(engine, entityCacheHolder);
    this._IconStopbehaviorProvider = IconStopbehaviorProvider;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._posInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    this._drawableIdIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    this._IconStopbehaviorDescriptionIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.IconStopbehaviorDescription
    );
    return [this._reelIndex, this._posInReelIndex, this._drawableIdIndex, this._enumerationIndex];
  }

  processEntity(entity: Entity): void {
    const speedComponent = entity.get(this._speedIndex) as Vector2;
    if (
      entity.hasComponent(this._IconStopbehaviorDescriptionIndex) ||
      (entity.hasComponent(this._speedIndex) && speedComponent.length < 15.0)
    ) {
      return;
    }

    const reel: number = entity.get<number>(this._reelIndex);
    const posInReel: number = entity.get(this._posInReelIndex);

    const valueDescription: IconStopbehaviorDescription =
      this._IconStopbehaviorProvider.getValueDescription(
        reel,
        posInReel
      ) as IconStopbehaviorDescription;
    if (valueDescription) {
      this._IconStopbehaviorProvider.AnimationCounter++;
      entity.addComponent(
        IconStopbehaviorComponentNames.IconStopbehaviorDescription,
        valueDescription
      );
      entity.addComponent(IconStopbehaviorComponentNames.DirtyIconStopbehavior, true);
    }
  }
}
