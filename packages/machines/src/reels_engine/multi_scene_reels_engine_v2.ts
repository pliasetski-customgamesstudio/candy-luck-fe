import { StringUtils } from '@cgs/shared';
import { Container, Vector2, IntervalAction, SceneObject } from '@cgs/syd';
import {
  T_IGameConfigProvider,
  T_AbstractIconResourceProvider,
  T_IconValuesSystems,
} from '../type_definitions';
import { EntitiesEngine } from './entities_engine/entities_engine';
import { Entity } from './entities_engine/entity';
import { ComponentNames } from './entity_components/component_names';
import { IconValuesSystems } from './game_components/icon_values_systems';
import { IIconModel } from './i_icon_model';
import { IReelsConfig } from './i_reels_config';
import { IconEnumerator } from './icon_enumerator';
import { IconsSceneObject } from './icons_scene_object';
import { MultiSceneReelsEngine } from './multi_scene_reels_engine';
import { ReelsEngineSystemUpdateOrders } from './reels_engine';
import { ReelsSoundModel } from './reels_sound_model';
import { GameStateMachine } from './state_machine/game_state_machine';
import { AccelerationSystem } from './systems/acceleration_system';
import { AfterBrakingSystem } from './systems/after_braking_system';
import { AnimationSystem } from './systems/animation_system';
import { BrakingSystem } from './systems/braking_system';
import { CheckIconSystemV2 } from './systems/check_icon_system_v2';
import { CommandSystem } from './systems/command_system';
import { MovementSystem } from './systems/movement_system';
import { MultiScenePlacementSystem } from './systems/multi_scene_placement_system';
import { AbstractIconResourceProvider } from '../game/components/abstract_icon_resource_provider';
import { MultiSceneRenderSystem } from './systems/multi_scene_render_system';
import { ISpinResponse } from '@cgs/common';
import { PortalSystemV2 } from './systems/portal_system_v2';
import { BeforeBrakingSystemV2 } from './systems/before_braking_system_v2';
import { ListSet } from './utils/list_set';
import { MultiSceneIconResourceProvider } from '../game/components/multi_scene_icon_resource_provider';
import { IGameConfigProvider } from '../game/components/interfaces/i_game_config_provider';
import { IconModel } from '../game/components/icon_model';

export class MultiSceneReelsEngineV2 extends MultiSceneReelsEngine {
  set startAnimOnIcon(value: boolean) {
    if (this.symbolPlacementSystem instanceof MultiScenePlacementSystem) {
      (this.symbolPlacementSystem as MultiScenePlacementSystem).startAnimOnIcon = value;
    }
  }
  get startAnimOnIcon(): boolean {
    if (this.symbolPlacementSystem instanceof MultiScenePlacementSystem) {
      return (this.symbolPlacementSystem as MultiScenePlacementSystem).startAnimOnIcon;
    }
    return false;
  }

  get iconResourceProvider(): MultiSceneIconResourceProvider {
    if (!this._iconResourceProvider) {
      this._iconResourceProvider = this.container.forceResolve<AbstractIconResourceProvider>(
        T_AbstractIconResourceProvider
      ) as MultiSceneIconResourceProvider;
    }

    return this._iconResourceProvider;
  }

  constructor(
    container: Container,
    entityEngine: EntitiesEngine,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconModel: IIconModel,
    iconsEnumerator: IconEnumerator,
    ReelConfig: IReelsConfig,
    gameStateMachine: GameStateMachine<ISpinResponse>,
    reelsSoundModel: ReelsSoundModel,
    useSounds: boolean,
    animatedIcons?: number[],
    animName?: string,
    componentsCount?: number,
    iconLimits?: Map<number, number>
  ) {
    super(
      container,
      entityEngine,
      iconRender,
      animIconRender,
      iconModel,
      iconsEnumerator,
      ReelConfig,
      gameStateMachine,
      reelsSoundModel,
      useSounds,
      animatedIcons,
      animName,
      componentsCount,
      iconLimits
    );
    this._iconNodeIndex = entityEngine.getComponentIndex(ComponentNames.IconNode);
  }

  createSystems(): void {
    const _iconValuesSystems = this.container.resolve<IconValuesSystems>(T_IconValuesSystems);
    this.commandSystem = new CommandSystem(this.entityEngine, this.internalConfig, this.iconModel);
    this.renderSystem = new MultiSceneRenderSystem(
      this.entityEngine,
      this.iconResourceProvider,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconModel,
      this.iconRender,
      this.animIconRender,
      this.iconDrawOrderCalculator,
      this.iconsEnumerator,
      this.internalConfig,
      _iconValuesSystems
    ).withInitialize() as MultiSceneRenderSystem;
    this.movementSystem = new MovementSystem(
      this.entityEngine,
      this.entityCacheHolder
    ).withInitialize() as MovementSystem;
    this.portalSystem = new PortalSystemV2(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig
    ).withInitialize() as PortalSystemV2;
    this.symbolPlacementSystem = new MultiScenePlacementSystem(
      this.entityEngine,
      this.iconResourceProvider,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator,
      this.animatedIcons,
      this.animName,
      _iconValuesSystems
    ).withInitialize() as MultiScenePlacementSystem;
    this.accelerationSystem = new AccelerationSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig
    ).withInitialize() as AccelerationSystem;
    this.brakingSystem = new BrakingSystem(this.entityEngine, this.entityCacheHolder, (reel) =>
      this.playStopReelSound(reel)
    ).withInitialize() as BrakingSystem;
    this.afterBrakingSystem = new AfterBrakingSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator
    ).withInitialize() as AfterBrakingSystem;
    this.beforeBrakingSystem = new BeforeBrakingSystemV2(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator
    ).withInitialize() as BeforeBrakingSystemV2;
    this.checkIconSystem = new CheckIconSystemV2(
      this.entityEngine,
      this.entityCacheHolder,
      this.iconsEnumerator,
      this.internalConfig
    ).withInitialize() as CheckIconSystemV2;
    this.animationSystem = new AnimationSystem(this.entityEngine);

    this.accelerationSubscription = this.accelerationSystem.reelAccelerated.listen((s) =>
      this.onReelAccelerated(s)
    );
    this.brakingSubscription = this.brakingSystem.directionChange.listen((t) =>
      this.onReelDirectionChange(t.item1)
    );
    this.brakingSubscription = this.brakingSystem.entityDirectionChange.listen((t) =>
      this.onEntityDirectionChange(t.item1, t.item2)
    );
    this.afterBrakingSubscription = this.afterBrakingSystem.entityStopped.listen((s) =>
      this.onEntityStopped(s)
    );

    this.commandSystem.updateOrder = ReelsEngineSystemUpdateOrders.commandSystemUpdateOrder;
    this.accelerationSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.accelerationSystemUpdateOrder;
    this.beforeBrakingSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.beforeBrakingSystemUpdateOrder;
    this.checkIconSystem.updateOrder = ReelsEngineSystemUpdateOrders.checkIconSystemUpdateOrder;
    this.brakingSystem.updateOrder = ReelsEngineSystemUpdateOrders.brakingSystemUpdateOrder;
    this.afterBrakingSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.afterBrakingSystemUpdateOrder;
    this.movementSystem.updateOrder = ReelsEngineSystemUpdateOrders.movementSystemUpdateOrder;
    this.portalSystem.updateOrder = ReelsEngineSystemUpdateOrders.portalSystemUpdateOrder;
    this.symbolPlacementSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.symbolPlacementSystemUpdateOrder;
    this.renderSystem.updateOrder = ReelsEngineSystemUpdateOrders.renderSystemUpdateOrder;
    this.animationSystem.updateOrder = ReelsEngineSystemUpdateOrders.animationSystemUpdateOrder;

    this.commandSystem.register();
    this.movementSystem.register();
    this.renderSystem.register();
    this.portalSystem.register();
    this.symbolPlacementSystem.register();
    this.accelerationSystem.register();
    this.brakingSystem.register();
    this.afterBrakingSystem.register();
    this.beforeBrakingSystem.register();
    this.checkIconSystem.register();
    this.animationSystem.register();
  }

  createEntities(): void {
    const gameConfig =
      this.container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;

    let maxPosition = this.internalConfig.lineCount * this.internalConfig.reelCount;
    if (
      gameConfig &&
      gameConfig.staticConfig &&
      gameConfig.staticConfig.spinedReels &&
      gameConfig.staticConfig.spinedReels.length > 0
    ) {
      let maxLength = 0;
      for (const spinnedReels of gameConfig.staticConfig.spinedReels) {
        if (spinnedReels.length > maxLength) {
          maxLength = spinnedReels.length;
        }
      }
      maxPosition = Math.max(
        maxLength - 1,
        this.internalConfig.lineCount * this.internalConfig.reelCount
      );
    }

    const randomPosition = this._random.nextInt(maxPosition) + this.internalConfig.lineCount;
    const iconModel = super.iconModel as IconModel;
    for (let i = iconModel.minStaticIconId; i <= iconModel.maxStaticIconId; i++) {
      if (this.iconLimits && this.iconLimits.has(i)) {
        const newIconLimit = this.iconLimits.get(i) as number;
        this._iconResourceProvider.checkAndCreate(
          StringUtils.format('icon_{0}', [i]),
          newIconLimit
        );
      } else {
        this._iconResourceProvider.checkAndCreate(StringUtils.format('icon_{0}', [i]), 30);
      }
    }

    for (let reel = 0; reel < this.internalConfig.reelCount; ++reel) {
      const offset = this.internalConfig.reelsOffset[reel];

      for (let lineIndex = 0; lineIndex < this.internalConfig.lineCount; ++lineIndex) {
        const symbol = new Entity(this.entityEngine);
        const lineIndexPos = lineIndex - this.internalConfig.additionalUpLines;

        symbol.addComponent(
          ComponentNames.Position,
          new Vector2(
            Math.ceil(reel * this.internalConfig.symbolSizeByReel[reel].x + offset.x),
            lineIndexPos * this.internalConfig.symbolSizeByReel[reel].y + offset.y
          )
        );

        const enumerationIndex = randomPosition - lineIndex - 1;
        const tape = this.iconsEnumerator.getInitial(reel, lineIndex);

        const iconScene = this._iconResourceProvider.getStaticIconNodes(
          StringUtils.format('icon_{0}', [tape])
        );

        symbol.addComponent(ComponentNames.IconNode, iconScene);
        symbol.addComponent(ComponentNames.DrawableIndex, tape);
        symbol.addComponent(ComponentNames.ReelIndex, reel);
        symbol.addComponent(ComponentNames.LineIndex, lineIndexPos);
        symbol.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
        symbol.addComponent(ComponentNames.Visible, true);
        symbol.addComponent(ComponentNames.SingleSpinningIndex, false);
        symbol.register();
        this.entityCacheHolder.addEntities(reel, lineIndexPos, false, [symbol]);
      }
    }
    const animationEntity = new Entity(this.entityEngine);

    animationEntity.addComponent(ComponentNames.ProcessAnimation, new ListSet<IntervalAction>());
    animationEntity.register();
  }

  CreateSingleEntity(
    reelIndex: number,
    lineIndex: number,
    drawbleId: number,
    AbstractMultisceneIconResourceProviderurceProvider: any,
    markers: string[]
  ): Entity {
    const entity = new Entity(this.entityEngine);
    const offset = this.internalConfig.reelsOffset[reelIndex];
    const ss = this.ReelConfig.symbolSizeByReel as Vector2[];
    entity.addComponent(
      ComponentNames.Position,
      new Vector2(ss[reelIndex].x * reelIndex + offset.x, ss[reelIndex].y * lineIndex + offset.y)
    );
    entity.addComponent(ComponentNames.DrawableIndex, drawbleId);
    entity.addComponent(ComponentNames.ReelIndex, reelIndex);
    entity.addComponent(ComponentNames.LineIndex, lineIndex);
    entity.addComponent(ComponentNames.Visible, true);
    const iconScene = this.iconResourceProvider.getStaticIconNodes(
      StringUtils.format('icon_{0}', [drawbleId])
    );
    entity.addComponent(ComponentNames.IconNode, iconScene);
    markers.forEach((m) => entity.addComponent(m, true));

    return entity;
  }

  startAnimation(entity: Entity, animationName: string): void {
    if (entity.hasComponent(this._iconNodeIndex)) {
      this.commandSystem.startAnimationInSingleIcon(entity, animationName);
      const so = entity.get<SceneObject>(this._iconNodeIndex) as IconsSceneObject;
      so.stateMachine!.switchToState(animationName);
    } else {
      this.commandSystem.startAnimation(entity, animationName);
    }
  }

  stopAnimation(entity: Entity, animationName: string): void {
    if (entity.hasComponent(this._iconNodeIndex)) {
      this.commandSystem.stopAnimationInSingleIcon(entity, animationName);
      const so = entity.get<SceneObject>(this._iconNodeIndex) as IconsSceneObject;
      so.stateMachine!.switchToState('default');
    } else {
      this.commandSystem.stopAnimtion(entity, animationName);
    }
  }

  switchIconToState(entity: Entity, animationName: string): void {
    if (entity.hasComponent(this._iconNodeIndex)) {
      this.commandSystem.stopAnimationInSingleIcon(entity, animationName);
      const so = entity.get<SceneObject>(this._iconNodeIndex) as IconsSceneObject;
      so.stateMachine!.switchToState('default');
      so.stateMachine!.switchToState(animationName);
    }
  }

  switchIconToStateWithoutReset(entity: Entity, animationName: string): void {
    if (entity.hasComponent(this._iconNodeIndex)) {
      this.commandSystem.stopAnimationInSingleIcon(entity, animationName);
      const so = entity.get<SceneObject>(this._iconNodeIndex) as IconsSceneObject;
      so.stateMachine!.switchToState(animationName);
    }
  }
}
