import { Container, Vector2, SceneObject } from '@cgs/syd';
import { UpdateRenderSystem } from './update_render_system';
import { ISpinResponse } from '@cgs/common';
import { ComponentIndex } from '../entities_engine/component_index';
import { MultiSceneIconResourceProvider } from '../../game/components/multi_scene_icon_resource_provider';
import { IconEnumerator } from '../icon_enumerator';
import { GameStateMachine } from '../state_machine/game_state_machine';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { IconInfo, IconsSceneObject } from '../icons_scene_object';
import { IIconModel } from '../i_icon_model';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { IIconDrawOrderCalculator } from '../game_components_providers/i_icon_draw_order_calculator';
import { InternalReelsConfig } from '../internal_reels_config';
import { IGameStateMachineProvider } from '../game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';
import { LongIconEnumerator } from '../long_icon_enumerator';
import { LongStoppingIconEnumerator } from '../long_stopping_icons_enumerator';

export class Game120MultiSceneRenderSystem extends UpdateRenderSystem {
  private _iconNodeIndex: ComponentIndex;
  private _iconResourceProvider: MultiSceneIconResourceProvider;
  private _iconEnumerator: IconEnumerator;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

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
    container: Container
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
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._iconNodeIndex = this.engine.getComponentIndex(ComponentNames.IconNode);
    return super.getIndexesForFilter();
  }

  drawEntity(entity: Entity): void {
    const drawId: number = entity.get(this._drawableIndex) as number;
    const velocity = entity.get(this._velocityIndex) as Vector2;

    const pos: Vector2 = entity.get<Vector2>(this._positionIndex) as Vector2;
    const drawablePosition: Vector2 = Vector2.Zero.equals(velocity)
      ? new Vector2(pos.x, pos.y)
      : pos;

    const reel: number = entity.get<number>(this._reelIndex);
    const line: number = entity.hasComponent(this._positionInReelIndex)
      ? entity.get(this._positionInReelIndex)
      : entity.get<number>(this._lineIndex);

    if (entity.hasComponent(this._stickyIconIndex)) {
      this.drawStickyIcon(reel, drawId, drawablePosition, line, entity);
    } else if (!entity.hasComponent(this._animationIndex)) {
      if (entity.hasComponent(this._topLayerIconIndex)) {
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
      if (`icon_${drawableId}` == entity.get<SceneObject>(this._iconNodeIndex).id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        if (this._iconEnumerator instanceof LongIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
                entity.addComponent(ComponentNames.IconNode, iconScene);
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                icon = iconScene;
              }
            }
          }
        } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
                entity.addComponent(ComponentNames.IconNode, iconScene);
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                icon = iconScene;
              }
            }
          }
        } else {
          const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
          this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
          entity.addComponent(ComponentNames.IconNode, newicon);
          icon = newicon;
        }
      }
    } else {
      if (this._iconEnumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
            entity.addComponent(ComponentNames.IconNode, iconScene);
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            }
          }
        }
      } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
            entity.addComponent(ComponentNames.IconNode, iconScene);
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            }
          }
        }
      } else {
        const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
        this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
    }
    const iconInfo = this.getAnimIconInfo(reel, line, pos, drawableId, icon as SceneObject, entity);
    this._animIconRender.add(iconInfo);
  }

  drawTopIcon(reel: number, drawableId: number, pos: Vector2, line: number, entity: Entity): void {
    let icon: SceneObject | null = null;
    if (entity.hasComponent(this._iconNodeIndex)) {
      if (`icon_${drawableId}` == entity.get<SceneObject>(this._iconNodeIndex).id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        if (this._iconEnumerator instanceof LongIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
                entity.addComponent(ComponentNames.IconNode, iconScene);
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                icon = iconScene;
              }
            }
          }
        } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
                entity.addComponent(ComponentNames.IconNode, iconScene);
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                icon = iconScene;
              }
            }
          }
        } else {
          const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
          this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
          entity.addComponent(ComponentNames.IconNode, newicon);
          icon = newicon;
        }
      }
    } else {
      if (this._iconEnumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
            entity.addComponent(ComponentNames.IconNode, iconScene);
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            }
          }
        }
      } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
            entity.addComponent(ComponentNames.IconNode, iconScene);
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            }
          }
        }
      } else {
        const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
        this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
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
      if (`icon_${drawableId}` == entity.get<SceneObject>(this._iconNodeIndex).id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        if (this._iconEnumerator instanceof LongIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
                entity.addComponent(ComponentNames.IconNode, iconScene);
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                icon = iconScene;
              }
            }
          }
        } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
          const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
          if (longIconsEnumerator) {
            if (!longIconsEnumerator.isLong(drawableId)) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            } else {
              if (drawableId % 100 == 0) {
                const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
                entity.addComponent(ComponentNames.IconNode, iconScene);
                this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
                icon = iconScene;
              }
            }
          }
        } else {
          const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
          this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
          entity.addComponent(ComponentNames.IconNode, newicon);
          icon = newicon;
        }
      }
    } else {
      if (this._iconEnumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
            entity.addComponent(ComponentNames.IconNode, iconScene);
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            }
          }
        }
      } else if (this._iconEnumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
            entity.addComponent(ComponentNames.IconNode, iconScene);
            this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
            icon = iconScene;
          } else {
            if (drawableId % 100 == 0) {
              const iconScene = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
              entity.addComponent(ComponentNames.IconNode, iconScene);
              this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
              icon = iconScene;
            }
          }
        }
      } else {
        const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
        this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
        entity.addComponent(ComponentNames.IconNode, newicon);
        icon = newicon;
      }
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
      if (`icon_${drawableId}` == entity.get<SceneObject>(this._iconNodeIndex).id) {
        icon = entity.get<SceneObject>(this._iconNodeIndex);
      } else {
        const newicon = this._iconResourceProvider.getIconNodes_(`icon_${drawableId}`)[0];
        this._iconResourceProvider.returnIcon(entity.get<SceneObject>(this._iconNodeIndex));
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

  getAnimIconInfo(
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
    if (this._gameStateMachine.curResponse.isFreeSpins) {
      return new IconInfo(
        icon,
        pos,
        this._iconDrawOrderCalculator.getIconDrawOrder(icon, drawableId, reel, line),
        reel,
        line,
        isSingleSpinningEntity
      );
    } else {
      return new IconInfo(
        icon,
        pos,
        this._iconDrawOrderCalculator.getTopIconDrawOrder(icon, drawableId, reel, line),
        reel,
        line,
        isSingleSpinningEntity
      );
    }
  }
}
