import { Container, Vector2, IntervalAction, SceneObject } from '@cgs/syd';
import { StringUtils } from '../../../shared/src';
import { ComponentIndex } from './entities_engine/component_index';
import { EntitiesEngine } from './entities_engine/entities_engine';
import { Entity } from './entities_engine/entity';
import { ComponentNames } from './entity_components/component_names';
import { IIconModel } from './i_icon_model';
import { IReelsConfig } from './i_reels_config';
import { IconEnumerator } from './icon_enumerator';
import { IconsSceneObject } from './icons_scene_object';
import { ReelsEngine, ReelsEngineSystemUpdateOrders } from './reels_engine';
import { ReelsSoundModel } from './reels_sound_model';
import { GameStateMachine } from './state_machine/game_state_machine';
import { AccelerationSystem } from './systems/acceleration_system';
import { AfterBrakingSystem } from './systems/after_braking_system';
import { AnimationSystem } from './systems/animation_system';
import { BeforeBrakingSystem } from './systems/before_braking_system';
import { BrakingSystem } from './systems/braking_system';
import { MovementSystem } from './systems/movement_system';
import { MultiScenePlacementSystem } from './systems/multi_scene_placement_system';
import { PortalSystem } from './systems/portal_system';
import { ISpinResponse } from '@cgs/common';
import { T_IGameConfigProvider, T_AbstractIconResourceProvider } from '../type_definitions';
import { CheckIconSystem } from './systems/check_icon_system';
import { CommandSystem } from './systems/command_system';
import { MultiSceneRenderSystem } from './systems/multi_scene_render_system';
import { ListSet } from './utils/list_set';
import { MultiSceneIconResourceProvider } from '../game/components/multi_scene_icon_resource_provider';
import { AbstractIconResourceProvider } from '../game/components/abstract_icon_resource_provider';
import { IGameConfigProvider } from '../game/components/interfaces/i_game_config_provider';
import { IconModel } from '../game/components/icon_model';
import { AbstractMultisceneIconResourceProvider } from '../game/components/abstract_multiscene_icon_resource_provider';

export class MultiSceneReelsEngine extends ReelsEngine {
  protected _iconResourceProvider: MultiSceneIconResourceProvider;
  protected _iconNodeIndex: ComponentIndex;

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
      this.internalConfig
    ).withInitialize() as MultiSceneRenderSystem;
    this.movementSystem = new MovementSystem(
      this.entityEngine,
      this.entityCacheHolder
    ).withInitialize() as MovementSystem;
    this.portalSystem = new PortalSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig
    ).withInitialize() as PortalSystem;
    this.symbolPlacementSystem = new MultiScenePlacementSystem(
      this.entityEngine,
      this.iconResourceProvider,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator,
      this.animatedIcons,
      this.animName
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
    this.beforeBrakingSystem = new BeforeBrakingSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator
    ).withInitialize() as BeforeBrakingSystem;
    this.checkIconSystem = new CheckIconSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.iconsEnumerator,
      this.internalConfig
    ).withInitialize() as CheckIconSystem;
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
    if (gameConfig?.staticConfig?.spinedReels?.length > 0) {
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
        const newIconLimit = this.iconLimits.get(i)!;
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
            Math.ceil(reel * this.internalConfig.symbolSize.x + offset.x),
            lineIndexPos * this.internalConfig.symbolSize.y + offset.y
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
    iconResourceProvider: AbstractMultisceneIconResourceProvider,
    markers: string[]
  ): Entity {
    const entity = new Entity(this.entityEngine);
    const offset = this.internalConfig.reelsOffset[reelIndex];
    entity.addComponent(
      ComponentNames.Position,
      new Vector2(
        this.ReelConfig.symbolSize.x * reelIndex + offset.x,
        this.ReelConfig.symbolSize.y * lineIndex + offset.y
      )
    );
    entity.addComponent(ComponentNames.DrawableIndex, drawbleId);
    entity.addComponent(ComponentNames.ReelIndex, reelIndex);
    entity.addComponent(ComponentNames.LineIndex, lineIndex);
    entity.addComponent(ComponentNames.Visible, true);
    const iconScene = iconResourceProvider.getStaticIconNodes(
      StringUtils.format('icon_{0}', [drawbleId])
    );
    entity.addComponent(ComponentNames.IconNode, iconScene);
    markers.forEach((m) => entity.addComponent(m, true));

    return entity;
  }

  switchIconToDefault(entity: Entity): void {
    if (entity.hasComponent(this._iconNodeIndex)) {
      const iconNode = entity.get<SceneObject>(this._iconNodeIndex) as IconsSceneObject;
      if (!iconNode.stateMachine!.isActive('default'))
        iconNode.stateMachine!.switchToState('default');
    }
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
}
