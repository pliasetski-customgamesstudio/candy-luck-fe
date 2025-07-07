import { Vector2 } from '@cgs/syd';
import { IconStopbehaviorComponentNames } from '../game/components/icon_stop_behaviors/icon_stop_behavior_component_names';
import { IconWithValuesComponentNames } from '../game/components/icon_with_values/icon_with_values_component_names';
import { ComponentIndex } from './entities_engine/component_index';
import { EntitiesEngine } from './entities_engine/entities_engine';
import { Entity } from './entities_engine/entity';
import { EntityCacheHolder } from './game_components/entity_cache_holder';
import { IIconDrawOrderCalculator } from './game_components_providers/i_icon_draw_order_calculator';
import { IIconModel } from './i_icon_model';
import { IconsSceneObject } from './icons_scene_object';
import { InternalReelsConfig } from './internal_reels_config';
import { UpdateRenderSystem } from './systems/update_render_system';

export class RenderSystemWithStopbehaviors extends UpdateRenderSystem {
  private _IconStopbehaviorDescriptionIndex: ComponentIndex;
  private _iconStopbehaviorDescription: ComponentIndex;
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
    this._IconStopbehaviorDescriptionIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.IconStopbehaviorDescription
    );
    this._iconStopbehaviorDescription = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.IconStopbehaviorDescription
    );
    this._previousDrawIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.PreviousDrawableIndex
    );

    return super.getIndexesForFilter();
  }

  processEntity(entity: Entity): void {
    if (!entity.get(this._visibleIndex)) return;

    if (
      entity.hasComponent(this._previousDrawIndex) &&
      !entity.hasComponent(this._iconStopbehaviorDescription)
    ) {
      entity.set(this._drawableIndex, entity.get(this._previousDrawIndex));
      entity.removeComponent(IconStopbehaviorComponentNames.PreviousDrawableIndex);
      entity.addComponent(IconWithValuesComponentNames.DirtyIconValue, true);
    }

    const velocity = entity.get(this._velocityIndex) as Vector2;
    const drawId = entity.get(this._drawableIndex) as number;
    const reel = entity.get<number>(this._reelIndex) as number;
    const line = entity.hasComponent(this._positionInReelIndex)
      ? (entity.get(this._positionInReelIndex) as number)
      : (entity.get<number>(this._lineIndex) as number);
    const pos = entity.get<Vector2>(this._positionIndex) as Vector2;
    const drawablePosition = Vector2.Zero === velocity ? new Vector2(pos.x, pos.y) : pos;

    if (entity.hasComponent(this._stickyIconIndex)) {
      this.drawStickyIcon(reel, drawId, drawablePosition, line, entity);
      return;
    }
    if (entity.hasComponent(this._stickyIconIndex)) {
      this.drawStickyIcon(reel, drawId, drawablePosition, line, entity);
      return;
    }

    if (entity.hasComponent(this._animationIndex)) {
      this.drawAnimIcon(reel, drawId, drawablePosition, line, entity);
    } else if (
      entity.hasComponent(this._topLayerIconIndex) &&
      entity.get(this._topLayerIconIndex)
    ) {
      this.drawTopIcon(reel, drawId, drawablePosition, line, entity);
    } else {
      //TODO: move treashold blur speed spin config
      if (velocity && velocity.length > 15.0 && !entity.hasComponent(this._disableBlureIconIndex)) {
        this.drawBluredStaticIcon(reel, drawId, drawablePosition, line, entity);
      } else {
        this.drawStaticIcon(reel, drawId, drawablePosition, line, entity);
      }
    }
  }
}
