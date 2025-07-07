import { NumberFormatter } from '@cgs/common';
import {
  SceneObject,
  BitmapTextSceneObject,
  ParallelSimpleAction,
  SequenceSimpleAction,
  EmptyAction,
  FunctionAction,
  Vector2,
  State,
  EventStreamSubscription,
  Action,
} from '@cgs/syd';
import { IconWithValuesComponentNames } from '../../icon_with_values/icon_with_values_component_names';
import { SceneCache } from '../../scene_cache';
import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { IconsSceneObject, IconInfo } from '../../../../reels_engine/icons_scene_object';
import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { AbstractIconStopbehaviorProvider } from '../abstract_icon_stop_behavior_provider';
import { IconStopbehaviorComponentNames } from '../icon_stop_behavior_component_names';
import { IconStopbehaviorDescription } from '../icon_stop_behavior_description';

export class IconStopbehaviorRenderSystem extends BaseSystem {
  private _posIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _visibleIndex: ComponentIndex;
  get visibleIndex(): ComponentIndex {
    return this._visibleIndex;
  }
  private _animationIndex: ComponentIndex;
  get animationIndex(): ComponentIndex {
    return this._animationIndex;
  }
  private _speedIndex: ComponentIndex;
  get speedIndex(): ComponentIndex {
    return this._speedIndex;
  }
  private _stickyIconIndex: ComponentIndex;
  get stickyIconIndex(): ComponentIndex {
    return this._stickyIconIndex;
  }
  private _lineIndex: ComponentIndex;
  get lineIndex(): ComponentIndex {
    return this._lineIndex;
  }
  private _IconStopbehaviorDescriptionIndex: ComponentIndex;
  get iconStopbehaviorDescriptionIndex(): ComponentIndex {
    return this._IconStopbehaviorDescriptionIndex;
  }
  private _IconStopbehaviorSceneIndex: ComponentIndex;
  get iconStopbehaviorSceneIndex(): ComponentIndex {
    return this._IconStopbehaviorSceneIndex;
  }
  private _dirtyIconStopbehaviorIndex: ComponentIndex;
  private _drawIndex: ComponentIndex;
  get drawIndex(): ComponentIndex {
    return this._drawIndex;
  }
  private _singleSpinningIndex: ComponentIndex;
  get singleSpinningIndex(): ComponentIndex {
    return this._singleSpinningIndex;
  }

  private _iconNode: IconsSceneObject;
  private _animIconNode: IconsSceneObject;
  private _sceneCache: SceneCache;
  get sceneCache(): SceneCache {
    return this._sceneCache;
  }
  private _previousDrawIndex: ComponentIndex;
  private _IconStopbehaviorProvider: AbstractIconStopbehaviorProvider;
  get iconStopbehaviorProvider(): AbstractIconStopbehaviorProvider {
    return this._IconStopbehaviorProvider;
  }
  private _usedValueNodesPool: Map<IconStopbehaviorDescription, SceneObject> = new Map<
    IconStopbehaviorDescription,
    SceneObject
  >();

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    iconNode: IconsSceneObject,
    animIconNode: IconsSceneObject,
    sceneCache: SceneCache,
    IconStopbehaviorProvider: AbstractIconStopbehaviorProvider,
    iconScenes: string[] | null = null
  ) {
    super(engine, entityCacheHolder);
    this._iconNode = iconNode;
    this._animIconNode = animIconNode;
    this._sceneCache = sceneCache;
    this._IconStopbehaviorProvider = IconStopbehaviorProvider;
    if (iconScenes) {
      for (let scene of iconScenes) {
        for (let i = 0; i < 5; i++) {
          this._sceneCache.generateScene(scene);
        }
      }
    }
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._posIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._animationIndex = this.engine.getComponentIndex(ComponentNames.DrawAnimation);
    this._visibleIndex = this.engine.getComponentIndex(ComponentNames.Visible);
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._stickyIconIndex = this.engine.getComponentIndex(ComponentNames.StickyIcon);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    this._IconStopbehaviorDescriptionIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.IconStopbehaviorDescription
    );
    this._IconStopbehaviorSceneIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.IconStopbehaviorScene
    );
    this._dirtyIconStopbehaviorIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.DirtyIconStopbehavior
    );
    this._drawIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._previousDrawIndex = this.engine.getComponentIndex(
      IconStopbehaviorComponentNames.PreviousDrawableIndex
    );
    this._singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    return [this._posIndex, this._reelIndex, this._IconStopbehaviorDescriptionIndex];
  }

  updateImpl(dt: number): void {
    let toRemove: IconStopbehaviorDescription[] = [];
    this._usedValueNodesPool.forEach((scene, description) => {
      let entities: Entity[] = [];
      this.engine.getAllEntities().forEach((e) => {
        if (
          e.hasComponent(this._IconStopbehaviorSceneIndex) &&
          e.get(this._IconStopbehaviorSceneIndex) == scene
        ) {
          entities.push(e);
        }
      });
      if (entities.length == 0) {
        this._sceneCache.putScene(description.scenePath, scene);
        this._IconStopbehaviorProvider.unregisterValueScene(scene);
        toRemove.push(description);
      }
    });

    for (let description of toRemove) {
      this._usedValueNodesPool.delete(description);
    }

    super.updateImpl(dt);
  }

  processEntity(entity: Entity): void {
    if (!entity.get(this._visibleIndex)) return;
    if (entity.hasComponent(this._stickyIconIndex) && entity.get(this._stickyIconIndex)) {
      this.drawAnimIcon(entity);
      return;
    }

    if (!entity.hasComponent(this._animationIndex)) {
      //TODO: move treashold blur speed spin config
      const speed = entity.get(this._speedIndex) as Vector2;
      if (entity.hasComponent(this._speedIndex) && speed.length > 15.0) {
        return;
      }

      this.drawStaticIcon(entity);
    } else {
      this.drawAnimIcon(entity);
    }
  }

  drawStaticIcon(entity: Entity): void {
    let iconInfo: IconInfo = this.getIconInfo(entity);
    this._iconNode.add(iconInfo);

    if (
      entity.hasComponent(this._dirtyIconStopbehaviorIndex) &&
      entity.get(this._dirtyIconStopbehaviorIndex)
    ) {
      entity.removeComponent(IconStopbehaviorComponentNames.DirtyIconStopbehavior);
      this.applyIconStopbehaviorState(entity, iconInfo);
    }
  }

  drawAnimIcon(entity: Entity): void {
    let iconInfo: IconInfo = this.getIconInfo(entity);
    this._animIconNode.add(iconInfo);

    if (
      entity.hasComponent(this._dirtyIconStopbehaviorIndex) &&
      entity.get(this._dirtyIconStopbehaviorIndex)
    ) {
      entity.removeComponent(IconStopbehaviorComponentNames.DirtyIconStopbehavior);
      this.applyIconStopbehaviorState(entity, iconInfo);
    }
  }

  applyIconStopbehaviorState(entity: Entity, iconInfo: IconInfo): void {
    let valueDescription: IconStopbehaviorDescription = entity.get(
      this._IconStopbehaviorDescriptionIndex
    );
    if (
      valueDescription.valueTextNodeId &&
      valueDescription.valueTextNodeId.length > 0 &&
      typeof valueDescription.numberValue === 'number' &&
      iconInfo.icon
    ) {
      let textNode: BitmapTextSceneObject = iconInfo.icon.findById(
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
      let subscriptionOnState: EventStreamSubscription<State>;

      const state = iconInfo.icon.stateMachine.findById(valueDescription.state) as State;
      let enterAction = state.enterAction;
      state.enterAction = new ParallelSimpleAction([
        new SequenceSimpleAction([
          new EmptyAction().withDuration(0.05),
          new FunctionAction(() => {
            if (!entity.hasComponent(this._previousDrawIndex)) {
              entity.addComponent(
                IconStopbehaviorComponentNames.PreviousDrawableIndex,
                entity.get(this._drawIndex)
              );
              const drawIndex = entity.get(this._drawIndex) as number;
              entity.set(this._drawIndex, -drawIndex);
            }
          }),
        ]),
        enterAction,
      ]);
      subscriptionOnState = state.leaved.listen((e) => {
        state.enterAction = enterAction;
        subscriptionOnState.cancel();
      });

      iconInfo.icon.stateMachine.switchToState('default');
      iconInfo.icon.stateMachine.switchToState(valueDescription.state);
      let subscription: EventStreamSubscription<Action>;
      subscription = iconInfo.icon.stateMachine
        .findById('default')
        ?.enterAction.beginning.listen((e) => {
          if (
            entity.hasComponent(this._previousDrawIndex) &&
            !entity.hasComponent(this._IconStopbehaviorDescriptionIndex)
          ) {
            entity.set(this._drawIndex, entity.get(this._previousDrawIndex));
            entity.removeComponent(IconStopbehaviorComponentNames.PreviousDrawableIndex);
            entity.addComponent(IconWithValuesComponentNames.DirtyIconValue, true);
          }
          entity.removeComponent(IconStopbehaviorComponentNames.IconStopbehaviorScene);
          entity.removeComponent(IconStopbehaviorComponentNames.IconStopbehaviorDescription);
          this._IconStopbehaviorProvider.AnimationCounter--;
          subscription.cancel();
        }) as EventStreamSubscription<Action>;
    }

    entity.removeComponent(IconStopbehaviorComponentNames.IconStopbehaviorScene);
    entity.addComponent(IconStopbehaviorComponentNames.IconStopbehaviorScene, iconInfo.icon);
  }

  getIconInfo(entity: Entity): IconInfo {
    let valueDescription: IconStopbehaviorDescription = entity.get(
      this._IconStopbehaviorDescriptionIndex
    );
    let reel: number = entity.get<number>(this._reelIndex);
    let line: number = entity.get<number>(this._lineIndex);
    let isSingleSpinning: boolean = false;
    if (entity.hasComponent(this._singleSpinningIndex)) {
      isSingleSpinning = entity.get(this._singleSpinningIndex);
    }
    let scene: SceneObject | null = null;
    if (entity.hasComponent(this._IconStopbehaviorDescriptionIndex)) {
      scene = entity.get(this._IconStopbehaviorSceneIndex);
    } else {
      scene = this.getValueNode(valueDescription);
    }

    let info: IconInfo = new IconInfo(
      this.getValueNode(valueDescription),
      this.getDrawablePos(entity),
      200,
      reel,
      line,
      isSingleSpinning
    );
    return info;
  }

  getDrawablePos(entity: Entity): Vector2 {
    let pos = entity.get(this._posIndex) as Vector2;
    return entity.hasComponent(this._speedIndex) ? new Vector2(pos.x, pos.y) : pos;
  }

  getValueNode(IconStopbehaviorDescription: IconStopbehaviorDescription): SceneObject {
    if (this._usedValueNodesPool.has(IconStopbehaviorDescription)) {
      return this._usedValueNodesPool.get(IconStopbehaviorDescription) as SceneObject;
    }

    let scene = this._sceneCache.getScene(IconStopbehaviorDescription.scenePath);
    if (scene) {
      this._IconStopbehaviorProvider.registerValueScene(scene);
      this._usedValueNodesPool.set(IconStopbehaviorDescription, scene);
    }

    return scene;
  }
}
