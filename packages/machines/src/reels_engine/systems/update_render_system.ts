import { Vector2, SceneObject, truncateToDouble } from '@cgs/syd';

import { BaseSystem } from './base_system';
import { InternalReelsConfig } from '../internal_reels_config';
import { IIconModel } from '../i_icon_model';
import { IconInfo, IconsSceneObject } from '../icons_scene_object';
import { IIconDrawOrderCalculator } from '../game_components_providers/i_icon_draw_order_calculator';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export class UpdateRenderSystem extends BaseSystem {
  protected _config: InternalReelsConfig;
  private _model: IIconModel;
  protected _iconRender: IconsSceneObject;
  protected _animIconRender: IconsSceneObject;
  protected _iconDrawOrderCalculator: IIconDrawOrderCalculator;
  protected _positionIndex: ComponentIndex;
  protected _drawableIndex: ComponentIndex;
  protected _velocityIndex: ComponentIndex;
  protected _reelIndex: ComponentIndex;
  protected _positionInReelIndex: ComponentIndex;
  protected _lineIndex: ComponentIndex;
  protected _visibleIndex: ComponentIndex;
  protected _animationIndex: ComponentIndex;
  protected _stickyIconIndex: ComponentIndex;
  protected _disableBlureIconIndex: ComponentIndex;
  protected _singleSpinningIndex: ComponentIndex;
  protected _topLayerIconIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    model: IIconModel,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconDrawOrderCalculator: IIconDrawOrderCalculator
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
    this._model = model;
    this._iconRender = iconRender;
    this._animIconRender = animIconRender;
    this._iconDrawOrderCalculator = iconDrawOrderCalculator;
  }

  public getIndexesForFilter(): ComponentIndex[] {
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._drawableIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._positionInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    this._visibleIndex = this.engine.getComponentIndex(ComponentNames.Visible);
    this._animationIndex = this.engine.getComponentIndex(ComponentNames.DrawAnimation);
    this._velocityIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._stickyIconIndex = this.engine.getComponentIndex(ComponentNames.StickyIcon);
    this._disableBlureIconIndex = this.engine.getComponentIndex(
      ComponentNames.DisableBlureIconIndex
    );
    this._singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    this._topLayerIconIndex = this.engine.getComponentIndex(ComponentNames.TopLayerIcon);
    return [this._positionIndex, this._drawableIndex, this._reelIndex];
  }

  public processEntity(entity: Entity): void {
    if (entity.get(this._visibleIndex)) {
      this.drawEntity(entity);
    }
  }

  public drawEntity(entity: Entity): void {
    const drawId: number = entity.get(this._drawableIndex);
    const velocity = entity.get(this._velocityIndex) as Vector2;

    const pos: Vector2 = entity.get<Vector2>(this._positionIndex);
    const drawablePosition: Vector2 = Vector2.Zero.equals(velocity)
      ? new Vector2(truncateToDouble(pos.x), truncateToDouble(pos.y))
      : pos;

    const reel: number = entity.get<number>(this._reelIndex);
    const line: number = entity.hasComponent(this._positionInReelIndex)
      ? entity.get(this._positionInReelIndex)
      : entity.get<number>(this._lineIndex);

    if (entity.hasComponent(this._stickyIconIndex)) {
      this.drawStickyIcon(reel, drawId, drawablePosition, line, entity);
    } else if (!entity.hasComponent(this._animationIndex)) {
      // TODO: move blur treadhold to spin config
      if (velocity && velocity.length > 15.0 && !entity.hasComponent(this._disableBlureIconIndex)) {
        this.drawBluredStaticIcon(reel, drawId, drawablePosition, line, entity);
      } else if (
        entity.hasComponent(this._topLayerIconIndex) &&
        entity.get(this._topLayerIconIndex)
      ) {
        this.drawTopIcon(reel, drawId, drawablePosition, line, entity);
      } else {
        this.drawStaticIcon(reel, drawId, drawablePosition, line, entity);
      }
    } else if (entity.hasComponent(this._animationIndex)) {
      this.drawAnimIcon(reel, drawId, drawablePosition, line, entity);
    }
  }

  public drawAnimIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    for (const icon of this._model.getAnimIcon(drawableId)) {
      const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon, entity);
      this._animIconRender.add(iconInfo);
    }
  }

  public drawTopIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    for (const icon of this._model.getStaticIcon(drawableId)) {
      const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon, entity);
      this._animIconRender.add(iconInfo);
    }
  }

  public drawStaticIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    for (const icon of this._model.getStaticIcon(drawableId)) {
      const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon, entity);
      this._iconRender.add(iconInfo);
    }
  }

  public drawBluredStaticIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    for (const icon of this._model.getBluredStaticIcon(drawableId)) {
      const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon, entity);
      this._iconRender.add(iconInfo);
    }
  }

  public drawStickyIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    for (const icon of this._model.getStaticIcon(drawableId)) {
      const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon, entity);
      this._animIconRender.add(iconInfo);
    }
  }

  public updateImpl(dt: number): void {
    if (this._iconRender.length > 0) {
      this._iconRender.clear();
    }
    if (this._animIconRender.length > 0) {
      this._animIconRender.clear();
    }
    super.updateImpl(dt);
  }

  public getIconInfo(
    reel: number,
    line: number,
    pos: Vector2,
    drawableId: number,
    icon: SceneObject,
    entity: Entity
  ): IconInfo {
    let isSingleSpinningEntity = false;
    if (entity.hasComponent(this._singleSpinningIndex)) {
      isSingleSpinningEntity = entity.get(this._singleSpinningIndex);
    }
    if (entity.hasComponent(this._topLayerIconIndex) && entity.get(this._topLayerIconIndex)) {
      return new IconInfo(
        icon,
        pos,
        this._iconDrawOrderCalculator.getTopIconDrawOrder(icon, drawableId, reel, line),
        reel,
        line,
        isSingleSpinningEntity
      );
    } else {
      return new IconInfo(
        icon,
        pos,
        this._iconDrawOrderCalculator.getIconDrawOrder(icon, drawableId, reel, line),
        reel,
        line,
        isSingleSpinningEntity
      );
    }
  }
}
