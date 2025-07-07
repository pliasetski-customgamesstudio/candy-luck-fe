import { NumberFormatter } from '@cgs/common';
import { Vector2, BitmapTextSceneObject, Action, EventStreamSubscription, State } from '@cgs/syd';
import { ComponentIndex } from '../../reels_engine/entities_engine/component_index';
import { EntitiesEngine } from '../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { EntityCacheHolder } from '../../reels_engine/game_components/entity_cache_holder';
import { IconsSceneObject, IconInfo } from '../../reels_engine/icons_scene_object';
import { AbstractIconWithValuesProvider } from './icon_with_values/abstract_icon_with_values_provider';
import { IconWithValuesComponentNames } from './icon_with_values/icon_with_values_component_names';
import { IconWithValuesRenderSystem } from './icon_with_values/systems/icon_with_values_render_system';
import { SceneCache } from './scene_cache';
import { IconValueDescription } from './icon_with_values/icon_value_description';

export class CustomIconWithValuesRenderSystem extends IconWithValuesRenderSystem {
  private _previousDrawIndex: ComponentIndex;
  private _drawIndex: ComponentIndex;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    iconNode: IconsSceneObject,
    animIconNode: IconsSceneObject,
    sceneCache: SceneCache,
    iconWithValuesProvider: AbstractIconWithValuesProvider
  ) {
    super(engine, entityCacheHolder, iconNode, animIconNode, sceneCache, iconWithValuesProvider);
  }

  getIndexesForFilter(): ComponentIndex[] {
    const posIndex = this.engine.getComponentIndex(ComponentNames.Position);
    const reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    const animationIndex = this.engine.getComponentIndex(ComponentNames.DrawAnimation);
    const visibleIndex = this.engine.getComponentIndex(ComponentNames.Visible);
    const speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    const staticAnimationIndex = this.engine.getComponentIndex(ComponentNames.ShowStaticAnimation);
    const lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    this._drawIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    const iconValueDescriptionIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueDescription
    );
    const iconValueSceneIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueScene
    );
    const dirtyIconValueIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.DirtyIconValue
    );
    const singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    this._previousDrawIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.PreviousDrawableIndex
    );
    return [posIndex, reelIndex, iconValueDescriptionIndex];
  }

  processEntity(entity: Entity): void {
    if (!entity.get(this.visibleIndex)) return;
    if (entity.hasComponent(this.staticAnimationIndex) && entity.get(this.staticAnimationIndex)) {
      this.drawAnimIcon(entity);
      return;
    }

    if (!entity.hasComponent(this.animationIndex)) {
      //TODO: move treashold blur speed spin config
      if (
        entity.hasComponent(this.speedIndex) &&
        entity.get<Vector2>(this.speedIndex).length > 15.0
      ) {
        return;
      }

      this.drawStaticIcon(entity);
    } else {
      this.drawAnimIcon(entity);
    }
  }

  applyIconValueState(entity: Entity, iconInfo: IconInfo): void {
    const valueDescription = entity.get(this.iconValueDescriptionIndex) as IconValueDescription;
    if (!valueDescription) {
      return;
    }
    if (
      valueDescription.valueTextNodeId &&
      valueDescription.valueTextNodeId.length > 0 &&
      typeof valueDescription.numberValue === 'number' &&
      iconInfo.icon
    ) {
      const textNode = iconInfo.icon.findById(
        valueDescription.valueTextNodeId
      ) as BitmapTextSceneObject;
      if (textNode) {
        textNode.text = NumberFormatter.formatLongCoins(valueDescription.numberValue);
      }
    }

    if (
      valueDescription.state &&
      valueDescription.state.length > 0 &&
      iconInfo.icon &&
      iconInfo.icon.stateMachine
    ) {
      iconInfo.icon.stateMachine.switchToState('default');
      iconInfo.icon.stateMachine.switchToState(valueDescription.state);
      const _action: Action | null = null;
      let subscription: EventStreamSubscription<State> | null = null;
      subscription = iconInfo.icon.stateMachine.findById('default')!.entered.listen(() => {
        if (subscription) {
          subscription.cancel();
        }
      });
      let subscriptionLeaved: EventStreamSubscription<State> | null = null;
      subscriptionLeaved = iconInfo.icon.stateMachine
        .findById(valueDescription.state)!
        .leaved.listen(() => {
          entity.removeComponent(IconWithValuesComponentNames.IconValueScene);
          entity.removeComponent(IconWithValuesComponentNames.IconValueDescription);
          subscriptionLeaved!.cancel();
        });
    }
    iconInfo.icon.z =
      entity.get<number>(this.reelIndex) * 100 + (entity.get(this.lineIndex) as number) * 10;
    entity.removeComponent(IconWithValuesComponentNames.IconValueScene);
    entity.addComponent(IconWithValuesComponentNames.IconValueScene, iconInfo.icon);
  }
}
