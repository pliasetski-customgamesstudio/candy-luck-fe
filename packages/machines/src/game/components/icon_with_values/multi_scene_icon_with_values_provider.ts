import { ResponseDependentGameComponentProvider } from '../response_dependent_game_component_provider';
import { MultiSceneReelsEngine } from '../../../reels_engine/multi_scene_reels_engine';
import { IconsSceneObjectComponent } from '../icons_scene_object_component';
import { SceneCache } from '../scene_cache';
import { IconWithValuesRenderSystem } from './systems/icon_with_values_render_system';
import { MultiSceneIconValueDescription } from './multi_scene_icon_value_description';
import { Container } from '@cgs/syd';
import {
  T_IconsSceneObjectComponent,
  T_IReelsConfigProvider,
  T_ISlotGameEngineProvider,
  T_SceneCache,
} from '../../../type_definitions';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { MultiSceneIconWithValuesPlacementSystem } from './systems/multi_scene_icon_with_values_placement_system';
import { ReelsEngineSystemUpdateOrders } from '../../../reels_engine/reels_engine';
import { MultiSceneIconWithValuesRenderSystem } from './systems/multi_scene_icon_with_values_render_system';
import { MultiSceneIconResourceProvider } from '../multi_scene_icon_resource_provider';
import { AbstractIconResourceProvider } from '../abstract_icon_resource_provider';

export class MultiSceneIconWithValuesProvider extends ResponseDependentGameComponentProvider {
  private _reelsEngine: MultiSceneReelsEngine;
  get reelsEngine(): MultiSceneReelsEngine {
    return this._reelsEngine;
  }
  private _iconNodeProvider: IconsSceneObjectComponent;
  private _sceneCache: SceneCache;
  private _renderSystem: IconWithValuesRenderSystem;
  private _valueDescriptions: Map<number, MultiSceneIconValueDescription> = new Map<
    number,
    MultiSceneIconValueDescription
  >();
  get valueDescriptions(): Map<number, MultiSceneIconValueDescription> {
    return this._valueDescriptions;
  }
  private _container: Container;
  get container(): Container {
    return this._container;
  }

  constructor(container: Container) {
    super(container);
    this._container = container;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as MultiSceneReelsEngine;
    this._iconNodeProvider = container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    );
    this._sceneCache = container.forceResolve<SceneCache>(T_SceneCache);

    this.gameStateMachine.stopping.entered.listen((_e) => this.setIconPrice());
    this.gameStateMachine.stopping.entered.listen((_e) => {
      this._valueDescriptions.clear();
    });
    this.createSystems();
  }

  getValueDescription(reel: number, line: number): MultiSceneIconValueDescription | null {
    const position = this._reelsEngine.iconAnimationHelper.getTruePosition(reel, line);
    if (this._valueDescriptions.has(position)) {
      return this._valueDescriptions.get(position) ?? null;
    }
    return null;
  }

  getFakeValueDescription(
    _reel: number,
    _line: number,
    _drawId: number
  ): MultiSceneIconValueDescription | null {
    return null;
  }

  protected createSystems(): void {
    const placementSystem = new MultiSceneIconWithValuesPlacementSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this
    ).withInitialize();
    placementSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.symbolPlacementSystemUpdateOrder + 1;
    placementSystem.register();
    const iconResourceProvider = this._container.forceResolve<AbstractIconResourceProvider>(
      T_IReelsConfigProvider
    ) as MultiSceneIconResourceProvider;
    const renderSystem = new MultiSceneIconWithValuesRenderSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this,
      iconResourceProvider
    ).withInitialize();
    renderSystem.updateOrder = ReelsEngineSystemUpdateOrders.renderSystemUpdateOrder - 1;
    renderSystem.register();
  }

  public setIconPrice(): void {
    const response = this.gameStateMachine.curResponse;
    if (
      !response.specialSymbolGroups ||
      !response.specialSymbolGroups.some((g) => g.type == 'SymbolPrice')
    ) {
      return;
    }

    const groups = response.specialSymbolGroups.filter((g) => g.type == 'SymbolPrice');
    for (const group of groups) {
      const pos = group.positions![0];
      if (this._valueDescriptions.has(pos)) {
        this._valueDescriptions.delete(pos);
      }
      this._valueDescriptions.set(
        pos,
        new MultiSceneIconValueDescription('icon_txt', group.totalJackPotWin, pos, group.subType)
      );
    }
  }

  deinitialize(): void {
    super.deinitialize();
  }
}
