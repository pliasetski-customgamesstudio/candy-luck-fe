import { NumberFormatter } from '@cgs/common';
import {
  Action,
  BitmapTextSceneObject,
  EventStreamSubscription,
  IStreamSubscription,
  SceneObject,
  State,
} from '@cgs/syd';
import { AbstractIconStopbehaviorProvider } from '../../icon_stop_behaviors/abstract_icon_stop_behavior_provider';
import { IconStopbehaviorComponentNames } from '../../icon_stop_behaviors/icon_stop_behavior_component_names';
import { IconStopbehaviorDescription } from '../../icon_stop_behaviors/icon_stop_behavior_description';
import { IconStopbehaviorRenderSystem } from '../../icon_stop_behaviors/systems/icon_stop_behavior_render_system';
import { SceneCache } from '../../scene_cache';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { IconsSceneObject, IconInfo } from '../../../../reels_engine/icons_scene_object';

export class Game112IconStopBehaviorRenderSystem extends IconStopbehaviorRenderSystem {
  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    iconNode: IconsSceneObject,
    animIconNode: IconsSceneObject,
    sceneCache: SceneCache,
    iconStopbehaviorProvider: AbstractIconStopbehaviorProvider,
    iconScenes: string[] | null = null
  ) {
    super(
      engine,
      entityCacheHolder,
      iconNode,
      animIconNode,
      sceneCache,
      iconStopbehaviorProvider,
      iconScenes
    );
  }

  applyIconStopbehaviorState(entity: Entity, iconInfo: IconInfo): void {
    const valueDescription: IconStopbehaviorDescription = entity.get(
      this.iconStopbehaviorDescriptionIndex
    );
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
      let subscriptionOnState: IStreamSubscription | undefined;
      // eslint-disable-next-line prefer-const
      subscriptionOnState = iconInfo.icon.stateMachine
        .findById(valueDescription.state)
        ?.enterAction.beginning.listen((_e) => {
          subscriptionOnState?.cancel();
        });

      iconInfo.icon.stateMachine.switchToState('default');
      iconInfo.icon.stateMachine.switchToState(valueDescription.state);
      let subscription: EventStreamSubscription<Action> | undefined;
      let subscriptionLeaved: EventStreamSubscription<State> | undefined;
      // eslint-disable-next-line prefer-const
      subscription = iconInfo.icon.stateMachine
        .findById('default')
        ?.enterAction.beginning.listen((_e) => {
          entity.removeComponent(IconStopbehaviorComponentNames.IconStopbehaviorScene);
          entity.removeComponent(IconStopbehaviorComponentNames.IconStopbehaviorDescription);
          this.iconStopbehaviorProvider.AnimationCounter--;
          subscription?.cancel();
        });
      // eslint-disable-next-line prefer-const
      subscriptionLeaved = iconInfo.icon.stateMachine
        .findById(valueDescription.state)
        ?.leaved.listen((_e) => {
          subscriptionLeaved?.cancel();
        }) as EventStreamSubscription<State>;
    }

    entity.removeComponent(IconStopbehaviorComponentNames.IconStopbehaviorScene);
    entity.addComponent(IconStopbehaviorComponentNames.IconStopbehaviorScene, iconInfo.icon);
  }

  getIconInfo(entity: Entity): IconInfo {
    const valueDescription: IconStopbehaviorDescription = entity.get(
      this.iconStopbehaviorDescriptionIndex
    );
    const reel: number = entity.get(this.reelIndex);
    const line: number = entity.get(this.lineIndex);
    let isSingleSpinning: boolean = false;
    if (entity.hasComponent(this.singleSpinningIndex)) {
      isSingleSpinning = entity.get(this.singleSpinningIndex);
    }
    //bool isSingleSpinning = entity.get(_singleSpinningIndex);
    let _scene: SceneObject | null = null;
    if (entity.hasComponent(this.iconStopbehaviorDescriptionIndex)) {
      _scene = entity.get(this.iconStopbehaviorSceneIndex);
    } else {
      _scene = this.getValueNode(valueDescription);
    }

    const info: IconInfo = new IconInfo(
      this.getValueNode(valueDescription),
      this.getDrawablePos(entity),
      200,
      reel,
      line,
      isSingleSpinning
    );
    info.icon.z = info.position.y + 299.0 + reel;
    info.z = info.position.y + 300.0 + reel;
    return info;
  }
}
