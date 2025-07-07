import { UpdateRenderSystem } from './update_render_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { IconsSceneObject } from '../icons_scene_object';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { InternalReelsConfig } from '../internal_reels_config';
import { IIconDrawOrderCalculator } from '../game_components_providers/i_icon_draw_order_calculator';
import { IIconModel } from '../i_icon_model';
import { IconWithValuesComponentNames } from '../../game/components/icon_with_values/icon_with_values_component_names';
import { Entity } from '../entities_engine/entity';

export class Game102UpdateRenderSystem extends UpdateRenderSystem {
  private _iconValueDescriptionIndex: ComponentIndex;
  private _previousDrawIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    model: IIconModel,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconDrawOrderCalculator: IIconDrawOrderCalculator
  ) {
    super(
      engine,
      entityCacheHolder,
      config,
      model,
      iconRender,
      animIconRender,
      iconDrawOrderCalculator
    );
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._iconValueDescriptionIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueDescription
    );
    this._previousDrawIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.PreviousDrawableIndex
    );
    return super.getIndexesForFilter();
  }

  processEntity(entity: Entity): void {
    if (!entity.get(this._visibleIndex)) {
      return;
    }
    if (
      entity.hasComponent(this._previousDrawIndex) &&
      !entity.hasComponent(this._iconValueDescriptionIndex)
    ) {
      entity.set(this._drawableIndex, entity.get(this._previousDrawIndex));
      entity.removeComponent(IconWithValuesComponentNames.PreviousDrawableIndex);
    }
    this.drawEntity(entity);
  }
}
