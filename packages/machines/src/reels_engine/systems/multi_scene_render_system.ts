import { StringUtils } from '@cgs/shared';
import { Vector2, SceneObject } from '@cgs/syd';
import { UpdateRenderSystem } from './update_render_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { MultiSceneIconResourceProvider } from '../../game/components/multi_scene_icon_resource_provider';
import { IconEnumerator } from '../icon_enumerator';
import { IconValuesSystems } from '../game_components/icon_values_systems';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { IIconModel } from '../i_icon_model';
import { IconInfo, IconsSceneObject } from '../icons_scene_object';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { IIconDrawOrderCalculator } from '../game_components_providers/i_icon_draw_order_calculator';
import { InternalReelsConfig } from '../internal_reels_config';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';
import { LongIconEnumerator } from '../long_icon_enumerator';
import { LongStoppingIconEnumerator } from '../long_stopping_icons_enumerator';

export class MultiSceneRenderSystem extends UpdateRenderSystem {
  private _iconNodeIndex: ComponentIndex;
  private _iconResourceProvider: MultiSceneIconResourceProvider;
  private _iconEnumerator: IconEnumerator;
  private _iconValuesSystems: IconValuesSystems;
  get disableBlureIconIndex(): ComponentIndex {
    return this._disableBlureIconIndex;
  }

  constructor(
    engine: EntitiesEngine,
    iconResourceProvider: MultiSceneIconResourceProvider,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    model: IIconModel,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconDrawOrderCalculator: IIconDrawOrderCalculator,
    iconEnumerator: IconEnumerator,
    _config: InternalReelsConfig,
    _iconValuesSystems: IconValuesSystems | null = null
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
    this._iconResourceProvider = iconResourceProvider;
    this._iconEnumerator = iconEnumerator;

    this._disableBlureIconIndex = engine.getComponentIndex(ComponentNames.DisableBlureIconIndex);
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._iconNodeIndex = this.engine.getComponentIndex(ComponentNames.IconNode);
    const result = super.getIndexesForFilter();
    return result;
  }

  processEntity(entity: Entity): void {
    if (entity.get(this._visibleIndex)) {
      this.drawEntity(entity);
      if (this._iconValuesSystems) {
        this._iconValuesSystems.renderIconValue(entity);
      }
    }
  }

  drawEntity(entity: Entity): void {
    const drawId: number = entity.get(this._drawableIndex);
    const velocity = entity.get(this._velocityIndex);

    const pos: Vector2 = entity.get<Vector2>(this._positionIndex);
    const drawablePosition: Vector2 = Vector2.Zero == velocity ? new Vector2(pos.x, pos.y) : pos;

    const reel: number = entity.get<number>(this._reelIndex);
    const line: number = entity.hasComponent(this._positionInReelIndex)
      ? entity.get(this._positionInReelIndex)
      : entity.get<number>(this._lineIndex);

    if (entity.hasComponent(this._stickyIconIndex)) {
      this.drawStickyIcon(reel, drawId, drawablePosition, line, entity);
    } else if (!entity.hasComponent(this._animationIndex)) {
      /*if(velocity && velocity.y > 9.0 && !entity.hasComponent(_disableBlureIconIndex) && !entity.hasComponent(positionInReelIndex)){
        drawBluredStaticIcon(reel, drawId, drawablePosition, line, entity);
      }
      else*/ if (entity.hasComponent(this._topLayerIconIndex)) {
        this.drawTopIcon(reel, drawId, drawablePosition, line, entity);
      } else {
        this.drawStaticIcon(reel, drawId, drawablePosition, line, entity);
      }
    } else if (entity.hasComponent(this._animationIndex)) {
      this.drawAnimIcon(reel, drawId, drawablePosition, line, entity);
    }
  }

  drawAnimIcon(reel: number, drawableId: number, pos: Vector2, line: number, entity: Entity): void {
    let icon: SceneObject | null = null;
    if (entity.hasComponent(this._iconNodeIndex)) {
      const so = entity.get(this._iconNodeIndex) as SceneObject;
      if (StringUtils.format('icon_{0}', [drawableId]) == so.id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        if (this._iconEnumerator instanceof LongIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScenes = this._iconResourceProvider.getIconNodes(
                  StringUtils.format('icon_{0}', [drawableId])
                );
                const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                entity.addComponent(ComponentNames.IconNode, iconScene);
                icon = iconScene;
              }
            }
          }
        } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScenes = this._iconResourceProvider.getIconNodes(
                  StringUtils.format('icon_{0}', [drawableId])
                );
                const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                entity.addComponent(ComponentNames.IconNode, iconScene);
                icon = iconScene;
              }
            }
          }
        } else {
          let newicon = this._iconResourceProvider.getStaticIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          );
          if (
            entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
            entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
          ) {
            const ni = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            ) as SceneObject[];
            newicon = ni[0];
            this._iconResourceProvider.returnIcon(
              entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
            );
          }
          entity.addComponent(ComponentNames.IconNode, newicon);
          icon = newicon;
        }
      }
    } else {
      if (this._iconEnumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScenes = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            );
            const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            entity.addComponent(ComponentNames.IconNode, iconScene);
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            }
          }
        }
      } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScenes = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            );
            const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            entity.addComponent(ComponentNames.IconNode, iconScene);
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            }
          }
        }
      } else {
        let newicon = this._iconResourceProvider.getStaticIconNodes(
          StringUtils.format('icon_{0}', [drawableId])
        );
        if (
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
          entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
        ) {
          const ni = this._iconResourceProvider.getIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          ) as SceneObject[];
          newicon = ni[0];
          this._iconResourceProvider.returnIcon(
            entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
          );
        }
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
    }
    const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon as SceneObject, entity);
    this._animIconRender.add(iconInfo);
  }

  drawTopIcon(reel: number, drawableId: number, pos: Vector2, line: number, entity: Entity): void {
    let icon: SceneObject | null = null;
    if (entity.hasComponent(this._iconNodeIndex)) {
      const so = entity.get(this._iconNodeIndex) as SceneObject;
      if (StringUtils.format('icon_{0}', [drawableId]) == so.id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        if (this._iconEnumerator instanceof LongIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScenes = this._iconResourceProvider.getIconNodes(
                  StringUtils.format('icon_{0}', [drawableId])
                );
                const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                entity.addComponent(ComponentNames.IconNode, iconScene);
                icon = iconScene;
              }
            }
          }
        } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScenes = this._iconResourceProvider.getIconNodes(
                  StringUtils.format('icon_{0}', [drawableId])
                );
                const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                entity.addComponent(ComponentNames.IconNode, iconScene);
                icon = iconScene;
              }
            }
          }
        } else {
          let newicon = this._iconResourceProvider.getStaticIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          );
          if (
            entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
            entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
          ) {
            const ni = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            ) as SceneObject[];
            newicon = ni[0];
            this._iconResourceProvider.returnIcon(
              entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
            );
          }
          entity.addComponent(ComponentNames.IconNode, newicon);
          icon = newicon;
        }
      }
    } else {
      if (this._iconEnumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScenes = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            );
            const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            entity.addComponent(ComponentNames.IconNode, iconScene);
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            }
          }
        }
      } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScenes = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            );
            const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            entity.addComponent(ComponentNames.IconNode, iconScene);
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            }
          }
        }
      } else {
        let newicon = this._iconResourceProvider.getStaticIconNodes(
          StringUtils.format('icon_{0}', [drawableId])
        );
        if (
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
          entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
        ) {
          const ni = this._iconResourceProvider.getIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          ) as SceneObject[];
          newicon = ni[0];
          this._iconResourceProvider.returnIcon(
            entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
          );
        }
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
    }
    const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon as SceneObject, entity);
    this._animIconRender.add(iconInfo);
  }

  drawStaticIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    let icon: SceneObject | null = null;
    if (entity.hasComponent(this._iconNodeIndex)) {
      const so = entity.get(this._iconNodeIndex) as SceneObject;
      if (StringUtils.format('icon_{0}', [drawableId]) == so.id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        if (this._iconEnumerator instanceof LongIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScenes = this._iconResourceProvider.getIconNodes(
                  StringUtils.format('icon_{0}', [drawableId])
                );
                const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                entity.addComponent(ComponentNames.IconNode, iconScene);
                icon = iconScene;
              }
            }
          }
        } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScenes = this._iconResourceProvider.getIconNodes(
                  StringUtils.format('icon_{0}', [drawableId])
                );
                const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                entity.addComponent(ComponentNames.IconNode, iconScene);
                icon = iconScene;
              }
            }
          }
        } else {
          let newicon = this._iconResourceProvider.getStaticIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          );
          if (
            entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
            entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
          ) {
            const newIcons = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            ) as SceneObject[];
            newicon = newIcons[0];
            this._iconResourceProvider.returnIcon(
              entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
            );
          }
          entity.addComponent(ComponentNames.IconNode, newicon);
          icon = newicon;
        }
      }
    } else {
      if (this._iconEnumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScenes = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            );
            const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            entity.addComponent(ComponentNames.IconNode, iconScene);
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            }
          }
        }
      } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScenes = this._iconResourceProvider.getIconNodes(
              StringUtils.format('icon_{0}', [drawableId])
            );
            const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            entity.addComponent(ComponentNames.IconNode, iconScene);
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScenes = this._iconResourceProvider.getIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
              const iconScene = iconScenes && iconScenes.length > 0 ? iconScenes[0] : null;
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              entity.addComponent(ComponentNames.IconNode, iconScene);
              icon = iconScene;
            }
          }
        }
      } else {
        let newicon = this._iconResourceProvider.getStaticIconNodes(
          StringUtils.format('icon_{0}', [drawableId])
        );
        if (
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
          entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
        ) {
          const ni = this._iconResourceProvider.getIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          ) as SceneObject[];
          newicon = ni[0];
          this._iconResourceProvider.returnIcon(
            entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
          );
        }
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
    }
    const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon as SceneObject, entity);
    this._iconRender.add(iconInfo);
  }

  drawBluredStaticIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    let icon: SceneObject | null = null;
    if (entity.hasComponent(this._iconNodeIndex)) {
      const so = entity.get(this._iconNodeIndex) as SceneObject;
      if (StringUtils.format('icon_{0}_blur', [drawableId]) == so.id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        const ni = this._iconResourceProvider.getBluredIconNodes(
          StringUtils.format('icon_{0}_blur', [drawableId])
        ) as SceneObject[];
        let newicon = ni[0];
        if (
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
          entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
        ) {
          const ni = this._iconResourceProvider.getBluredIconNodes(
            StringUtils.format('icon_{0}_blur', [drawableId])
          ) as SceneObject[];
          newicon = ni[0];
          this._iconResourceProvider.returnIcon(
            entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
          );
        }
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
    } else {
      const ni = this._iconResourceProvider.getBluredIconNodes(
        StringUtils.format('icon_{0}_blur', [drawableId])
      ) as SceneObject[];
      let newicon = ni[0];
      if (
        entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
        entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
      ) {
        const ni = this._iconResourceProvider.getIconNodes(
          StringUtils.format('icon_{0}_blur', [drawableId])
        ) as SceneObject[];
        newicon = ni[0];
        this._iconResourceProvider.returnIcon(
          entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
        );
      }
      entity.addComponent(ComponentNames.IconNode, newicon);
      icon = newicon;
    }

    const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon as SceneObject, entity);
    this._iconRender.add(iconInfo);
  }

  drawStickyIcon(
    reel: number,
    drawableId: number,
    pos: Vector2,
    line: number,
    entity: Entity
  ): void {
    let icon: SceneObject | null = null;
    if (entity.hasComponent(this._iconNodeIndex)) {
      const so = entity.get(this._iconNodeIndex) as SceneObject;
      if (StringUtils.format('icon_{0}', [drawableId]) == so.id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        let newicon = this._iconResourceProvider.getStaticIconNodes(
          StringUtils.format('icon_{0}', [drawableId])
        );
        if (
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.LoadSingleScene)) &&
          entity.get(this.engine.getComponentIndex(ComponentNames.LoadSingleScene))
        ) {
          const ni = this._iconResourceProvider.getIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          ) as SceneObject[];
          newicon = ni[0];
          this._iconResourceProvider.returnIcon(
            entity.get(this.engine.getComponentIndex(ComponentNames.IconNode))
          );
        }
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
    }

    entity.hasComponent(this._iconNodeIndex) ? entity.get<SceneObject>(this._iconNodeIndex) : null;
    const iconInfo = this.getIconInfo(reel, line, pos, drawableId, icon as SceneObject, entity);
    this._animIconRender.add(iconInfo);
  }

  getIconInfo(
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

    const symbolSizeY = !this._config?.symbolSizeByReel
      ? this._config?.symbolSize.y
      : this._config?.symbolSizeByReel[reel].y;

    const rawLine = pos.y / symbolSizeY;
    const adjustPos = 0.05;
    const trueLine = rawLine < 0 ? rawLine - adjustPos : rawLine + adjustPos;

    if (entity.hasComponent(this._topLayerIconIndex)) {
      return new IconInfo(
        icon,
        pos,
        this._iconDrawOrderCalculator.getTopIconDrawOrder(icon, drawableId, reel, trueLine),
        reel,
        line,
        isSingleSpinningEntity
      );
    } else {
      return new IconInfo(
        icon,
        pos,
        this._iconDrawOrderCalculator.getIconDrawOrder(icon, drawableId, reel, trueLine),
        reel,
        line,
        isSingleSpinningEntity
      );
    }
  }
}
