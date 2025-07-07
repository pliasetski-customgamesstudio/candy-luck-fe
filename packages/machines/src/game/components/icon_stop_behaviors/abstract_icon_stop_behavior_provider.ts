import { SceneObject, Container } from '@cgs/syd';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine, ReelsEngineSystemUpdateOrders } from '../../../reels_engine/reels_engine';
import {
  T_ISlotGameEngineProvider,
  T_IconsSceneObjectComponent,
  T_SceneCache,
} from '../../../type_definitions';
import { IconsSceneObjectComponent } from '../icons_scene_object_component';
import { ResponseDependentGameComponentProvider } from '../response_dependent_game_component_provider';
import { SceneCache } from '../scene_cache';
import { ConditionAction } from '../win_lines/complex_win_line_actions/condition_action';
import { IconStopbehaviorDescription } from './icon_stop_behavior_description';
import { IconStopbehaviorPlacementSystem } from './systems/icon_stop_behavior_placement_system';
import { IconStopbehaviorPortalSystem } from './systems/icon_stop_behavior_portal_system';
import { IconStopbehaviorRenderSystem } from './systems/icon_stop_behavior_render_system';

export class AbstractIconStopbehaviorProvider extends ResponseDependentGameComponentProvider {
  private _reelsEngine: ReelsEngine;
  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  private _iconNodeProvider: IconsSceneObjectComponent;
  get iconNodeProvider(): IconsSceneObjectComponent {
    return this._iconNodeProvider;
  }
  private _sceneCache: SceneCache;
  get sceneCache(): SceneCache {
    return this._sceneCache;
  }
  private _renderSystem: IconStopbehaviorRenderSystem;
  get renderSystem(): IconStopbehaviorRenderSystem {
    return this._renderSystem;
  }
  set renderSystem(value: IconStopbehaviorRenderSystem) {
    this._renderSystem = value;
  }
  private _valueDescriptions: Map<number, IconStopbehaviorDescription> = new Map<
    number,
    IconStopbehaviorDescription
  >();
  get valueDescriptions(): Map<number, IconStopbehaviorDescription> {
    return this._valueDescriptions;
  }
  private _usedValueScenes: SceneObject[] = [];
  AnimationCounter: number = 0;

  constructor(container: Container) {
    super(container);
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._iconNodeProvider = container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    );
    this._sceneCache = container.forceResolve<SceneCache>(T_SceneCache);

    this.gameStateMachine.stopping.entered.listen((e) => this.createValues());
    this.gameStateMachine.stop.leaved.listen((e) => this.clearValues());
    this.gameStateMachine.stopping.appendLazyAnimation(
      () =>
        new ConditionAction(() => {
          return this.AnimationCounter <= 0;
        })
    );
    this.gameStateMachine.immediatelyStop.appendLazyAnimation(
      () =>
        new ConditionAction(() => {
          return this.AnimationCounter <= 0;
        })
    );
    this.createSystems();
  }

  registerValueScene(scene: SceneObject): void {
    if (!this._usedValueScenes.includes(scene)) {
      this._usedValueScenes.push(scene);
    }
  }

  unregisterValueScene(scene: SceneObject): void {
    const index = this._usedValueScenes.indexOf(scene);
    if (index !== -1) {
      this._usedValueScenes.splice(index, 1);
    }
  }

  getValueDescription(reel: number, line: number): IconStopbehaviorDescription | null {
    const position = this._reelsEngine.iconAnimationHelper.getPosition(reel, line);
    if (this._valueDescriptions.has(position)) {
      return this._valueDescriptions.get(position) ?? null;
    }
    return null;
  }

  createSystems(): void {
    const portalSystem = new IconStopbehaviorPortalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this._reelsEngine.internalConfig
    ).withInitialize();
    portalSystem.updateOrder = ReelsEngineSystemUpdateOrders.portalSystemUpdateOrder - 1;
    portalSystem.register();

    const placementSystem = new IconStopbehaviorPlacementSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this
    ).withInitialize();
    placementSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.symbolPlacementSystemUpdateOrder - 1;
    placementSystem.register();

    this._renderSystem = new IconStopbehaviorRenderSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this._iconNodeProvider.iconsRender,
      this._iconNodeProvider.animIconsRender,
      this._sceneCache,
      this
    ).withInitialize() as IconStopbehaviorRenderSystem;
    this._renderSystem.updateOrder = ReelsEngineSystemUpdateOrders.renderSystemUpdateOrder + 1;
    this._renderSystem.register();
  }

  createValues(): void {}

  clearValues(): void {
    this._valueDescriptions.clear();
  }

  deinitialize(): void {
    super.deinitialize();
    for (const scene of this._usedValueScenes) {
      scene.deinitialize();
    }
  }
}
