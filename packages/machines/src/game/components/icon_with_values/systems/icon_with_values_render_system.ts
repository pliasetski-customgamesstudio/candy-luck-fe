import { NumberFormatter } from '@cgs/common';
import { SceneObject, BitmapTextSceneObject, Vector2 } from '@cgs/syd';
import { DrawOrderConstants } from '../../../common/slot/views/base_popup_view';
import { SceneCache } from '../../scene_cache';
import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { IconsSceneObject, IconInfo } from '../../../../reels_engine/icons_scene_object';
import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { AbstractIconWithValuesProvider } from '../abstract_icon_with_values_provider';
import { IconValueDescription } from '../icon_value_description';
import { IconWithValuesComponentNames } from '../icon_with_values_component_names';

export class IconWithValuesRenderSystem extends BaseSystem {
  private _posIndex: ComponentIndex;
  get posIndex(): ComponentIndex {
    return this._posIndex;
  }
  set posIndex(value: ComponentIndex) {
    this._posIndex = value;
  }
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  set reelIndex(value: ComponentIndex) {
    this._reelIndex = value;
  }
  private _visibleIndex: ComponentIndex;
  get visibleIndex(): ComponentIndex {
    return this._visibleIndex;
  }
  set visibleIndex(value: ComponentIndex) {
    this._visibleIndex = value;
  }
  private _animationIndex: ComponentIndex;
  get animationIndex(): ComponentIndex {
    return this._animationIndex;
  }
  set animationIndex(value: ComponentIndex) {
    this._animationIndex = value;
  }
  private _speedIndex: ComponentIndex;
  get speedIndex(): ComponentIndex {
    return this._speedIndex;
  }
  set speedIndex(value: ComponentIndex) {
    this._speedIndex = value;
  }
  private _stickyIconIndex: ComponentIndex;
  get stickyIconIndex(): ComponentIndex {
    return this._stickyIconIndex;
  }
  set stickyIconIndex(value: ComponentIndex) {
    this._stickyIconIndex = value;
  }
  private _staticAnimationIndex: ComponentIndex;
  get staticAnimationIndex(): ComponentIndex {
    return this._staticAnimationIndex;
  }
  set staticAnimationIndex(value: ComponentIndex) {
    this._staticAnimationIndex = value;
  }
  private _lineIndex: ComponentIndex;
  get lineIndex(): ComponentIndex {
    return this._lineIndex;
  }
  set lineIndex(value: ComponentIndex) {
    this._lineIndex = value;
  }
  private _iconValueDescriptionIndex: ComponentIndex;
  get iconValueDescriptionIndex(): ComponentIndex {
    return this._iconValueDescriptionIndex;
  }
  set iconValueDescriptionIndex(value: ComponentIndex) {
    this._iconValueDescriptionIndex = value;
  }
  private _iconValueSceneIndex: ComponentIndex;
  get iconValueSceneIndex(): ComponentIndex {
    return this._iconValueSceneIndex;
  }
  set iconValueSceneIndex(value: ComponentIndex) {
    this._iconValueSceneIndex = value;
  }
  private _dirtyIconValueIndex: ComponentIndex;
  get dirtyIconValueIndex(): ComponentIndex {
    return this._dirtyIconValueIndex;
  }
  set dirtyIconValueIndex(value: ComponentIndex) {
    this._dirtyIconValueIndex = value;
  }
  private _singleSpinningIndex: ComponentIndex;
  get singleSpinningIndex(): ComponentIndex {
    return this._singleSpinningIndex;
  }
  set singleSpinningIndex(value: ComponentIndex) {
    this._singleSpinningIndex = value;
  }
  private _iconNode: IconsSceneObject;
  get iconNode(): IconsSceneObject {
    return this._iconNode;
  }
  set iconNode(value: IconsSceneObject) {
    this._iconNode = value;
  }
  private _animIconNode: IconsSceneObject;
  get animIconNode(): IconsSceneObject {
    return this._animIconNode;
  }
  set animIconNode(value: IconsSceneObject) {
    this._animIconNode = value;
  }
  private _sceneCache: SceneCache;
  get sceneCache(): SceneCache {
    return this._sceneCache;
  }
  private _iconWithValuesProvider: AbstractIconWithValuesProvider;
  get iconWithValuesProvider(): AbstractIconWithValuesProvider {
    return this._iconWithValuesProvider;
  }
  private _usedValueNodesPool: Map<IconValueDescription, SceneObject> = new Map<
    IconValueDescription,
    SceneObject
  >();
  get usedValueNodesPool(): Map<IconValueDescription, SceneObject> {
    return this._usedValueNodesPool;
  }

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    _iconNode: IconsSceneObject,
    _animIconNode: IconsSceneObject,
    _sceneCache: SceneCache,
    _iconWithValuesProvider: AbstractIconWithValuesProvider,
    { iconScenes = null }: { iconScenes?: string[] | null } = {}
  ) {
    super(engine, entityCacheHolder);
    if (iconScenes) {
      for (let scene of iconScenes) {
        for (let i = 0; i < 10; i++) {
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
    this._iconValueDescriptionIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueDescription
    );
    this._iconValueSceneIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.IconValueScene
    );
    this._dirtyIconValueIndex = this.engine.getComponentIndex(
      IconWithValuesComponentNames.DirtyIconValue
    );
    this._singleSpinningIndex = this.engine.getComponentIndex(ComponentNames.SingleSpinningIndex);
    return [this._posIndex, this._reelIndex, this._iconValueDescriptionIndex];
  }

  updateImpl(dt: number): void {
    let toRemove: IconValueDescription[] = [];
    this._usedValueNodesPool.forEach((scene, description) => {
      let entities: Entity[] = [];
      this.engine.getAllEntities().forEach((e) => {
        if (
          e.hasComponent(this._iconValueSceneIndex) &&
          e.get(this._iconValueSceneIndex) == scene
        ) {
          entities.push(e);
        }
      });
      if (entities.length == 0) {
        this._sceneCache.putScene(description.scenePath, scene);
        this._iconWithValuesProvider.unregisterValueScene(scene);
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
      if (
        entity.hasComponent(this._speedIndex) &&
        (entity.get(this._speedIndex) as Vector2).length > 15.0
      ) {
        return;
      }

      this.drawStaticIcon(entity);
    } else {
      this.drawAnimIcon(entity);
    }
  }

  drawStaticIcon(entity: Entity): void {
    let iconInfo = this.getIconInfo(entity);
    this._iconNode.add(iconInfo);

    if (entity.hasComponent(this._dirtyIconValueIndex) && entity.get(this._dirtyIconValueIndex)) {
      entity.removeComponent(IconWithValuesComponentNames.DirtyIconValue);
      this.applyIconValueState(entity, iconInfo);
    }
  }

  drawAnimIcon(entity: Entity): void {
    let iconInfo = this.getIconInfo(entity);
    this._animIconNode.add(iconInfo);

    if (entity.hasComponent(this._dirtyIconValueIndex) && entity.get(this._dirtyIconValueIndex)) {
      entity.removeComponent(IconWithValuesComponentNames.DirtyIconValue);
      this.applyIconValueState(entity, iconInfo);
    }
  }

  applyIconValueState(entity: Entity, iconInfo: IconInfo): void {
    let valueDescription: IconValueDescription = entity.get(this._iconValueDescriptionIndex);
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
    }

    entity.removeComponent(IconWithValuesComponentNames.IconValueScene);
    entity.addComponent(IconWithValuesComponentNames.IconValueScene, iconInfo.icon);
  }

  getIconInfo(entity: Entity): IconInfo {
    let valueDescription: IconValueDescription = entity.get(this._iconValueDescriptionIndex);
    let reel: number = entity.get<number>(this._reelIndex);
    let line: number = entity.get<number>(this._lineIndex);
    let isSingleSpinning: boolean = false;
    if (entity.hasComponent(this._singleSpinningIndex)) {
      isSingleSpinning = entity.get(this._singleSpinningIndex);
    }
    let scene: SceneObject | null = null;
    if (entity.hasComponent(this._iconValueSceneIndex)) {
      scene = entity.get(this._iconValueSceneIndex);
    } else {
      scene = this.getValueNode(valueDescription);
    }

    let info: IconInfo = new IconInfo(
      this.getValueNode(valueDescription)!,
      this.getDrawablePos(entity),
      DrawOrderConstants.Top,
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

  getValueNode(iconValueDescription: IconValueDescription | null): SceneObject | null {
    if (!iconValueDescription) {
      return null;
    }
    if (this._usedValueNodesPool.has(iconValueDescription)) {
      return this._usedValueNodesPool.get(iconValueDescription)!;
    }

    let scene = this._sceneCache.getScene(iconValueDescription.scenePath);
    if (scene) {
      this._iconWithValuesProvider.registerValueScene(scene);
      this._usedValueNodesPool.set(iconValueDescription, scene);
    }

    return scene;
  }
}
