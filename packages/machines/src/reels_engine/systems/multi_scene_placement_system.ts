import { StringUtils } from '@cgs/shared';
import { SceneObject } from '@cgs/syd';
import { MultiSceneIconResourceProvider } from '../../game/components/multi_scene_icon_resource_provider';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { Entity } from '../entities_engine/entity';
import { ComponentNames } from '../entity_components/component_names';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { IconValuesSystems } from '../game_components/icon_values_systems';
import { IconEnumerator } from '../icon_enumerator';
import { InternalReelsConfig } from '../internal_reels_config';
import { LongIconEnumerator } from '../long_icon_enumerator';
import { LongStoppingIconEnumerator } from '../long_stopping_icons_enumerator';
import { SymbolPlacementSystem } from './symbol_placement_system';

export class MultiScenePlacementSystem extends SymbolPlacementSystem {
  private _iconNodeIndex: ComponentIndex;
  private _unloadIconIndex: ComponentIndex;
  private _iconResourceProvider: MultiSceneIconResourceProvider;
  private _animatedIcons: number[];
  private _animName: string;
  private _iconValuesSystems: IconValuesSystems | null;
  public startAnimOnIcon: boolean;

  constructor(
    engine: EntitiesEngine,
    iconResourceProvider: MultiSceneIconResourceProvider,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    enumerator: IconEnumerator,
    animatedIcons: number[],
    animName: string,
    iconValuesSystems: IconValuesSystems | null = null
  ) {
    super(engine, entityCacheHolder, config, enumerator);
    this._iconResourceProvider = iconResourceProvider;
    this._animatedIcons = animatedIcons;
    this._animName = animName;
    this._iconValuesSystems = iconValuesSystems;
  }

  public getIndexesForFilter(): ComponentIndex[] {
    this._iconNodeIndex = this.engine.getComponentIndex(ComponentNames.IconNode);
    this._unloadIconIndex = this.engine.getComponentIndex(ComponentNames.LoadSingleScene);
    return super.getIndexesForFilter();
  }

  public processEntity(entity: Entity): void {
    const relocated: number = entity.get<number>(this.relocatedFlagIndex);
    if (relocated !== 0) {
      const reel: number = entity.get<number>(this.reelIndex);
      let drawableId: number = entity.get<number>(this.drawableIndex);
      let enumerationId: number = entity.get<number>(this.enumerationIndex);
      const singleSpinningIndex: boolean = entity.get<boolean>(super.singleSpinningIndex);
      const enumerationStep: number = singleSpinningIndex ? 3 : this.config.lineCount;

      if (relocated > 0) {
        enumerationId += enumerationStep;
      } else if (relocated < 0) {
        enumerationId -= enumerationStep;
      }
      drawableId = this.enumerator.getNext(reel, enumerationId) as number;

      if (this.enumerator instanceof LongIconEnumerator) {
        const longIconEnumerator = this.enumerator as LongIconEnumerator;
        longIconEnumerator.mapSpinedLongIcons(reel, enumerationId, relocated, drawableId);
      }
      if (this.enumerator instanceof LongStoppingIconEnumerator) {
        const longIconEnumerator = this.enumerator as LongStoppingIconEnumerator;
        longIconEnumerator.mapSpinedLongIcons(reel, enumerationId, relocated, drawableId);
      }

      entity.set(this.enumerationIndex, enumerationId);
      entity.set(this.drawableIndex, drawableId);

      if (entity.hasComponent(this._iconNodeIndex) && entity.hasComponent(this._unloadIconIndex)) {
        const icon = entity.get<SceneObject>(this._iconNodeIndex);
        if (icon && icon.stateMachine) {
          icon.stateMachine.switchToState('default');
          icon.stateMachine.restart();
        }
        this._iconResourceProvider.returnIcon(icon);
        entity.removeComponent(ComponentNames.DrawAnimation);
        entity.removeComponent(ComponentNames.IconNode);
        entity.removeComponent(ComponentNames.LoadSingleScene);
      }

      if (this.enumerator instanceof LongIconEnumerator) {
        const longIconsEnumerator = this.enumerator as LongIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            let iconScene = null;
            if (
              this._animatedIcons &&
              this._animatedIcons.includes(drawableId) &&
              this.startAnimOnIcon
            ) {
              iconScene = this._iconResourceProvider.getIconNodes_(
                StringUtils.format('icon_{0}', [drawableId])
              )[0];
              iconScene.stateMachine!.switchToState(this._animName);
            } else {
              iconScene = this._iconResourceProvider.getStaticIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
            }
            entity.addComponent(ComponentNames.IconNode, iconScene);
          } else {
            if (drawableId % 100 === 0) {
              const iconScene = this._iconResourceProvider.getStaticIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              ) as SceneObject;
              if (
                this._animatedIcons &&
                this._animatedIcons.includes(drawableId) &&
                this.startAnimOnIcon
              ) {
                iconScene.stateMachine!.switchToState(this._animName);
              }
              entity.addComponent(ComponentNames.IconNode, iconScene);
            }
          }
        }
      } else if (this.enumerator instanceof LongStoppingIconEnumerator) {
        const longIconsEnumerator = this.enumerator as LongStoppingIconEnumerator;
        if (longIconsEnumerator) {
          if (!longIconsEnumerator.isLong(drawableId)) {
            let iconScene = null;
            if (
              this._animatedIcons &&
              this._animatedIcons.includes(drawableId) &&
              this.startAnimOnIcon
            ) {
              iconScene = this._iconResourceProvider.getIconNodes_(
                StringUtils.format('icon_{0}', [drawableId])
              )[0];
              iconScene.stateMachine!.switchToState(this._animName);
            } else {
              iconScene = this._iconResourceProvider.getStaticIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              );
            }
            entity.addComponent(ComponentNames.IconNode, iconScene);
          } else {
            if (drawableId % 100 === 0) {
              const iconScene = this._iconResourceProvider.getStaticIconNodes(
                StringUtils.format('icon_{0}', [drawableId])
              ) as SceneObject;
              if (
                this._animatedIcons &&
                this._animatedIcons.includes(drawableId) &&
                this.startAnimOnIcon
              ) {
                iconScene.stateMachine!.switchToState(this._animName);
              }
              entity.addComponent(ComponentNames.IconNode, iconScene);
            }
          }
        }
      } else {
        let iconScene = this._iconResourceProvider.getIconNodes_(
          StringUtils.format('icon_{0}', [drawableId])
        )[0];
        if (
          this._animatedIcons &&
          this._animatedIcons.includes(drawableId) &&
          this.startAnimOnIcon
        ) {
          iconScene = this._iconResourceProvider.getIconNodes_(
            StringUtils.format('icon_{0}', [drawableId])
          )[0];
          iconScene.stateMachine!.switchToState(this._animName);
        } else {
          iconScene = this._iconResourceProvider.getStaticIconNodes(
            StringUtils.format('icon_{0}', [drawableId])
          ) as SceneObject;
        }
        entity.addComponent(ComponentNames.IconNode, iconScene);
      }
      if (this._iconValuesSystems) {
        this._iconValuesSystems.placementIconValue(entity);
      }
    }
  }
}
