import { ISpinResponse } from '@cgs/common';
import {
  Container,
  EventDispatcher,
  EventStream,
  Tuple,
  Random,
  EventStreamSubscription,
  Vector2,
  IntervalAction,
} from '@cgs/syd';
import { EntitiesEngine } from './entities_engine/entities_engine';
import { Entity } from './entities_engine/entity';
import { ComponentNames } from './entity_components/component_names';
import { EntityCacheHolder } from './game_components/entity_cache_holder';
import { IIconDrawOrderCalculator } from './game_components_providers/i_icon_draw_order_calculator';
import { IIconModel } from './i_icon_model';
import { IReelsConfig } from './i_reels_config';
import { ISlotGameEngine } from './i_slot_game_engine';
import { IconEnumerator } from './icon_enumerator';
import { IconsSceneObject } from './icons_scene_object';
import { InternalReelsConfig } from './internal_reels_config';
import { ReelsSoundModel } from './reels_sound_model';
import { GameStateMachine } from './state_machine/game_state_machine';
import { AccelerationSystem } from './systems/acceleration_system';
import { AfterBrakingSystem } from './systems/after_braking_system';
import { AnimationSystem } from './systems/animation_system';
import { BeforeBrakingSystem } from './systems/before_braking_system';
import { BrakingSystem } from './systems/braking_system';
import { CheckIconSystem } from './systems/check_icon_system';
import { CommandSystem } from './systems/command_system';
import { MovementSystem } from './systems/movement_system';
import { PortalSystem } from './systems/portal_system';
import { SymbolPlacementSystem } from './systems/symbol_placement_system';
import { UpdateRenderSystem } from './systems/update_render_system';
import { IconAnimationHelper } from './utils/icon_animation_helper';
import { ListSet } from './utils/list_set';
import {
  T_IIconDrawOrderCalculator,
  T_IGameConfigProvider,
  T_InitialReelsComponent,
} from '../type_definitions';
import { IGameConfigProvider } from '../game/components/interfaces/i_game_config_provider';
import { InitialReelsComponent } from '../game/components/reel_net_api/initial_reels_component';

export class ReelsEngineSystemUpdateOrders {
  static readonly commandSystemUpdateOrder: number = 100;
  static readonly accelerationSystemUpdateOrder: number = 200;
  static readonly beforeBrakingSystemUpdateOrder: number = 300;
  static readonly checkIconSystemUpdateOrder: number = 350;
  static readonly brakingSystemUpdateOrder: number = 400;
  static readonly afterBrakingSystemUpdateOrder: number = 500;
  static readonly movementSystemUpdateOrder: number = 600;
  static readonly portalSystemUpdateOrder: number = 700;
  static readonly symbolPlacementSystemUpdateOrder: number = 800;
  static readonly renderSystemUpdateOrder: number = 900;
  static readonly animationSystemUpdateOrder: number = 1000;
}

export class ReelsEngine implements ISlotGameEngine {
  private _container: Container;
  get container(): Container {
    return this._container;
  }
  ReelConfig: IReelsConfig;
  entityEngine: EntitiesEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _reelsSoundModel: ReelsSoundModel;
  get reelsSoundModel(): ReelsSoundModel {
    return this._reelsSoundModel;
  }
  internalConfig: InternalReelsConfig;
  private _iconDrawOrderCalculator: IIconDrawOrderCalculator;
  get iconDrawOrderCalculator(): IIconDrawOrderCalculator {
    return this._iconDrawOrderCalculator;
  }
  private _useSounds: boolean;
  get useSounds(): boolean {
    return this._useSounds;
  }
  skipStopSounOnReels: number[];
  private _iconRender: IconsSceneObject;
  get iconRender(): IconsSceneObject {
    return this._iconRender;
  }
  private _animIconRender: IconsSceneObject;
  get animIconRender(): IconsSceneObject {
    return this._animIconRender;
  }
  private _iconModel: IIconModel;
  get iconModel(): IIconModel {
    return this._iconModel;
  }
  iconsEnumerator: IconEnumerator;
  get iconEnumerator(): IconEnumerator {
    return this.iconsEnumerator;
  }

  private _reelStoped: EventDispatcher<number> = new EventDispatcher<number>();
  get reelStoped(): EventStream<number> {
    return this._reelStoped.eventStream;
  }
  private _entityDirectionChanged: EventDispatcher<Tuple<number, number>> = new EventDispatcher<
    Tuple<number, number>
  >();
  get entityDirectionChanged(): EventStream<Tuple<number, number>> {
    return this._entityDirectionChanged.eventStream;
  }
  private _entityStoped: EventDispatcher<Tuple<number, number>> = new EventDispatcher<
    Tuple<number, number>
  >();
  get entityStoped(): EventStream<Tuple<number, number>> {
    return this._entityStoped.eventStream;
  }
  private _slotsStoped: EventDispatcher<void> = new EventDispatcher<void>();
  get slotsStoped(): EventStream<void> {
    return this._slotsStoped.eventStream;
  }
  private _reelAccelerated: EventDispatcher<number> = new EventDispatcher<number>();
  get reelAccelerated(): EventStream<number> {
    return this._reelAccelerated.eventStream;
  }
  private _slotsAccelerated: EventDispatcher<number> = new EventDispatcher<number>();
  get slotsAccelerated(): EventStream<number> {
    return this._slotsAccelerated.eventStream;
  }
  private _reelBraking: EventDispatcher<number> = new EventDispatcher<number>();
  get reelBraking(): EventStream<number> {
    return this._reelBraking.eventStream;
  }
  protected _random: Random = new Random();
  private _iconLimits: Map<number, number>;
  get iconLimits(): Map<number, number> {
    return this._iconLimits;
  }

  get isSlotAccelerated(): boolean {
    return this._reelAccelerateMask === 0;
  }

  isReelStopped(reel: number): boolean {
    return (this._reelStopMask & (1 << reel)) === 0;
  }

  isReelDirectionChanged(reel: number): boolean {
    return (this._directionChangeMask & (1 << reel)) === 0;
  }

  get isSlotStopped(): boolean {
    return this._reelStopMask === 0;
  }
  movementSystem: MovementSystem;
  brakingSystem: BrakingSystem;
  renderSystem: UpdateRenderSystem;
  beforeBrakingSystem: BeforeBrakingSystem;
  commandSystem: CommandSystem;
  afterBrakingSystem: AfterBrakingSystem;
  portalSystem: PortalSystem;
  symbolPlacementSystem: SymbolPlacementSystem;
  accelerationSystem: AccelerationSystem;
  checkIconSystem: CheckIconSystem;
  animationSystem: AnimationSystem;
  private _entityCacheHolder: EntityCacheHolder;
  private _reelAccelerateMask: number = 0;
  private _reelStopMask: number = 0;
  private _directionChangeMask: number = 0;
  private _acceleratedLineCount: number[];
  private _stoppedReels: number[];
  get stoppedReels(): number[] {
    return this._stoppedReels;
  }
  private _iconAnimationHelper: IconAnimationHelper;
  frozenReels: number[];
  stablePositions: boolean[][];
  private _animatedIcons: number[];
  get animatedIcons(): number[] {
    return this._animatedIcons;
  }

  get entityCacheHolder(): EntityCacheHolder {
    return this._entityCacheHolder;
  }

  private _animName: string;
  get animName(): string {
    return this._animName;
  }
  private _accelerationSubscription: EventStreamSubscription<number>;
  get accelerationSubscription(): EventStreamSubscription<number> {
    return this._accelerationSubscription;
  }
  set accelerationSubscription(value: EventStreamSubscription<number>) {
    this._accelerationSubscription = value;
  }
  private _brakingSubscription: EventStreamSubscription<Tuple<number, number>>;
  get brakingSubscription(): EventStreamSubscription<Tuple<number, number>> {
    return this._brakingSubscription;
  }
  set brakingSubscription(value: EventStreamSubscription<Tuple<number, number>>) {
    this._brakingSubscription = value;
  }
  private _afterBrakingSubscription: EventStreamSubscription<number[]>;
  get afterBrakingSubscription(): EventStreamSubscription<number[]> {
    return this._afterBrakingSubscription;
  }
  set afterBrakingSubscription(value: EventStreamSubscription<number[]>) {
    this._afterBrakingSubscription = value;
  }

  get iconAnimationHelper(): IconAnimationHelper {
    if (!this._iconAnimationHelper) {
      this._iconAnimationHelper = new IconAnimationHelper(this._container, this);
    }

    return this._iconAnimationHelper;
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
    animatedIcons?: number[] | null,
    _animName: string = '',
    componentsCount?: number,
    iconLimits?: Map<number, number>
  ) {
    this._container = container;
    this.entityEngine = entityEngine;
    this._iconRender = iconRender;
    this._animIconRender = animIconRender;
    this._iconModel = iconModel;
    this.iconsEnumerator = iconsEnumerator;
    this.ReelConfig = ReelConfig;
    this._gameStateMachine = gameStateMachine;
    this._reelsSoundModel = reelsSoundModel;
    this._useSounds = useSounds;
    this.skipStopSounOnReels = [];

    this._iconLimits = iconLimits || new Map<number, number>();
    this.internalConfig = this._createInternalConfig(ReelConfig);
    this._entityCacheHolder = new EntityCacheHolder(ReelConfig.reelCount);
    this._iconDrawOrderCalculator = this._container.forceResolve<IIconDrawOrderCalculator>(
      T_IIconDrawOrderCalculator
    );
    this._acceleratedLineCount = new Array<number>(ReelConfig.reelCount).fill(0);
    this.stablePositions = new Array<Array<boolean>>(ReelConfig.reelCount);
    for (let i = 0; i < ReelConfig.reelCount; i++) {
      const stableReelPositions = new Array<boolean>(ReelConfig.lineCount).fill(true);
      this.stablePositions[i] = stableReelPositions;
    }
    const config = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;

    console.log('ReelsEngine: initial reels');
    const initialReelsComponent =
      this._container.forceResolve<InitialReelsComponent>(T_InitialReelsComponent);

    iconsEnumerator.setInitialReels(
      initialReelsComponent.getInitialReels(
        this.internalConfig.reelCount,
        this.internalConfig.lineCount,
        this.internalConfig
      )
    );
    iconsEnumerator.setSpinedReels(
      initialReelsComponent.getSpinnedReels(config.staticConfig.spinedReels)
    );

    console.log('ReelsEngine: create systems');
    this.createSystems();

    console.log('ReelsEngine: create entities');
    this.createEntities();

    this._stoppedReels = [];
    this._gameStateMachine.accelerate.entered.listen((_obj) => {
      this._stoppedReels = [];
    });
    this.frozenReels = [];

    this.slotsStoped.listen(() => (this._reelAccelerateMask = 0));
  }

  protected _createInternalConfig(config: IReelsConfig): InternalReelsConfig {
    return new InternalReelsConfig(config);
  }

  updateReelsConfig(config: IReelsConfig): void {
    this.ReelConfig = config;
    this.internalConfig = this._createInternalConfig(this.ReelConfig);
    this.removeSystems();
    this.createSystems();
  }

  onReelDirectionChange(reel: number): void {
    this._directionChangeMask &= ~(1 << reel);
    this._reelBraking.dispatchEvent(reel);
  }

  onEntityDirectionChange(reel: number, line: number): void {
    this._entityDirectionChanged.dispatchEvent(new Tuple(reel, line));
  }

  onEntityStopped(position: number[]): void {
    if (position[1] >= 0 && position[1] < this.ReelConfig.lineCount) {
      this.stablePositions[position[0]][position[1]] = true;
    }
    this._entityStoped.dispatchEvent(new Tuple(position[0], position[1]));
    if (this.stablePositions[position[0]].every((p) => p)) {
      this._reelStopMask &= ~(1 << position[0]);
      this._reelStoped.dispatchEvent(position[0]);
      if (!this._stoppedReels.includes(position[0])) {
        this._stoppedReels.push(position[0]);
      }

      if (this._reelStopMask === 0) {
        this._slotsStoped.dispatchEvent();
      }
    }
  }

  onReelAccelerated(reel: number): void {
    this._reelAccelerateMask &= ~(1 << reel);
    this._reelAccelerated.dispatchEvent(reel);
    if (this._reelAccelerateMask === 0) {
      this._slotsAccelerated.dispatchEvent();
    }
  }

  startAnimation(entity: Entity, animationName: string): void {
    this.commandSystem.startAnimation(entity, animationName);
  }

  stopAnimation(entity: Entity, animationName: string): void {
    this.commandSystem.stopAnimtion(entity, animationName);
  }

  hideEntity(entity: Entity): void {
    const visibleIndex = this.entityEngine.getComponentIndex(ComponentNames.Visible);
    entity.set(visibleIndex, false);
  }

  showEntity(entity: Entity): void {
    const visibleIndex = this.entityEngine.getComponentIndex(ComponentNames.Visible);
    entity.set(visibleIndex, true);
  }

  getStopedEntities(reel: number, line: number, topLayerOnly: boolean = true): Entity[] {
    if (
      this._reelStopMask === 0 &&
      reel < this.internalConfig.reelCount &&
      line < this.internalConfig.lineCount
    ) {
      return this._entityCacheHolder.getAnimationEntities(reel, line, topLayerOnly);
    }
    throw new Error('Reels are not stopped');
  }

  getReelStopedEntities(reel: number, line: number, topLayerOnly: boolean = true): Entity[] {
    if (reel < this.internalConfig.reelCount && line < this.internalConfig.lineCount) {
      return this._entityCacheHolder.getAnimationEntities(reel, line, topLayerOnly);
    }
    throw new Error('Reels are not stopped');
  }

  getReelStopedEntitiesByPos(pos: number, topLayerOnly: boolean = true): Entity[] {
    const reel = this.getReelByPosition(pos);
    const line = this.getLineByPosition(pos);
    if (reel < this.internalConfig.reelCount && line < this.internalConfig.lineCount) {
      return this._entityCacheHolder.getAnimationEntities(reel, line, topLayerOnly);
    }
    throw new Error('Reels are not stopped');
  }

  accelerateReel(reel: number, startSpeed: Vector2, endSpeed: Vector2, time: number): void {
    if (!this.frozenReels.includes(reel)) {
      this._reelAccelerateMask |= 1 << reel;
      this._reelStopMask |= 1 << reel;
      this._directionChangeMask |= 1 << reel;

      for (let i = 0; i < this.stablePositions[reel].length; i++) {
        this.stablePositions[reel][i] = false;
      }

      const start = this.calculateSpeed(startSpeed);
      const end = this.calculateSpeed(endSpeed);
      this.commandSystem.accelerateReel(reel, start, end, time * 1000);
    }
  }

  accelerateSingleSpinningReel(
    reel: number,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number,
    lines: number[]
  ): void {
    const start = this.calculateSpeed(startSpeed);
    const end = this.calculateSpeed(endSpeed);
    this.commandSystem.accelerateSingleSpinningReel(reel, start, end, time * 1000, lines);
  }

  accelerateSpinningEntity(
    reel: number,
    line: number,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number
  ): void {
    const frameLength = 1000 / this.internalConfig.fps;
    this._reelStopMask |= 1 << reel;
    const newVelocity = new Vector2(
      (endSpeed.x / 1000) * frameLength,
      (endSpeed.y / 1000) * frameLength
    );
    this.commandSystem.accelerateSpinningEntityOnPosition(
      reel,
      line,
      startSpeed,
      newVelocity,
      time * 1000
    );
  }

  accelerateEntity(
    reel: number,
    line: number,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number
  ): void {
    if (++this._acceleratedLineCount[reel] >= this.ReelConfig.lineCount) {
      this._reelAccelerateMask |= 1 << reel;
      this._reelStopMask |= 1 << reel;
      this._directionChangeMask |= 1 << reel;
    }

    if (line >= 0 && line < this.ReelConfig.lineCount) {
      this.stablePositions[reel][line] = false;
    }

    const start = this.calculateSpeed(startSpeed);
    const end = this.calculateSpeed(endSpeed);
    this.commandSystem.accelerateEntityOnPosition(reel, line, start, end, time * 1000);
  }

  moveReel(reel: number, toPosition: Vector2, duration: number): void {
    this.commandSystem.moveReel(reel, toPosition, duration);
  }

  calculateSpeed(velocity: Vector2): Vector2 {
    return new Vector2(velocity.x / this.internalConfig.fps, velocity.y / this.internalConfig.fps);
  }

  getAnimationIconIds(position: number): number[] {
    const entities = this.iconAnimationHelper.getEntities(position);
    const drawIndex = this.entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
    return entities.map((e) => e.get(drawIndex)).map(Number);
  }

  getSoundIconIds(position: number): number[] {
    const entities = this.iconAnimationHelper.getSoundEntities(position);
    const drawIndex = this.entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
    return entities.map((e) => e.get(drawIndex)).map(Number);
  }

  stop(reel: number, winTapes: number[]): void {
    this.iconsEnumerator.setWinTapes(reel, winTapes);
    this.commandSystem.stopReel(reel);
  }

  stopEntity(reel: number, line: number, winIndex: number): void {
    this.iconsEnumerator.setWinIndex(reel, line, winIndex);
    this.commandSystem.stopEntity(reel, line);
  }

  createEntities(): void {
    const gameConfig = (
      this._container.forceResolve<IGameConfigProvider>(
        T_IGameConfigProvider
      ) as IGameConfigProvider
    ).gameConfig;

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

    for (let reel = 0; reel < this.internalConfig.reelCount; ++reel) {
      const offset = this.internalConfig.reelsOffset[reel];

      for (let lineIndex = 0; lineIndex < this.internalConfig.lineCount; ++lineIndex) {
        const symbol = new Entity(this.entityEngine);
        const lineIndexPos = lineIndex - this.internalConfig.additionalUpLines;

        symbol.addComponent(
          ComponentNames.Position,
          new Vector2(
            reel * Math.ceil(this.internalConfig.symbolSize.x + offset.x),
            lineIndexPos * this.internalConfig.symbolSize.y + offset.y
          )
        );

        const enumerationIndex = randomPosition - lineIndex - 1;
        const tape = this.iconsEnumerator.getInitial(reel, lineIndex);

        symbol.addComponent(ComponentNames.DrawableIndex, tape);
        symbol.addComponent(ComponentNames.ReelIndex, reel);
        symbol.addComponent(ComponentNames.LineIndex, lineIndexPos);
        symbol.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
        symbol.addComponent(ComponentNames.Visible, true);
        symbol.addComponent(ComponentNames.SingleSpinningIndex, false);
        symbol.register();
        if (lineIndexPos >= 0)
          this._entityCacheHolder.addEntities(reel, lineIndexPos, false, [symbol]);
      }
    }
    const animationEntity = new Entity(this.entityEngine);

    animationEntity.addComponent(ComponentNames.ProcessAnimation, new ListSet<IntervalAction>());
    animationEntity.register();
  }

  createSystems(): void {
    this.commandSystem = new CommandSystem(this.entityEngine, this.internalConfig, this._iconModel);
    this.renderSystem = new UpdateRenderSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.internalConfig,
      this._iconModel,
      this._iconRender,
      this._animIconRender,
      this._iconDrawOrderCalculator
    ).withInitialize();
    this.movementSystem = new MovementSystem(
      this.entityEngine,
      this._entityCacheHolder
    ).withInitialize();
    this.portalSystem = new PortalSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.internalConfig
    ).withInitialize();
    this.symbolPlacementSystem = new SymbolPlacementSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator
    ).withInitialize();
    this.accelerationSystem = new AccelerationSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.internalConfig
    ).withInitialize();
    this.brakingSystem = new BrakingSystem(this.entityEngine, this._entityCacheHolder, (reel) =>
      this.playStopReelSound(reel)
    ).withInitialize();
    this.afterBrakingSystem = new AfterBrakingSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator
    ).withInitialize();
    this.beforeBrakingSystem = new BeforeBrakingSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator
    ).withInitialize();
    this.checkIconSystem = new CheckIconSystem(
      this.entityEngine,
      this._entityCacheHolder,
      this.iconsEnumerator,
      this.internalConfig
    ).withInitialize();
    this.animationSystem = new AnimationSystem(this.entityEngine);

    this._accelerationSubscription = this.accelerationSystem.reelAccelerated.listen((_) =>
      this.onReelAccelerated(_ as number)
    );
    this._brakingSubscription = this.brakingSystem.directionChange.listen((t) =>
      this.onReelDirectionChange(t?.item1 as number)
    );
    this._brakingSubscription = this.brakingSystem.entityDirectionChange.listen((t) =>
      this.onEntityDirectionChange(t?.item1 as number, t?.item2 as number)
    );
    this._afterBrakingSubscription = this.afterBrakingSystem.entityStopped.listen((position) =>
      this.onEntityStopped(position)
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

  removeSystems(): void {
    this._accelerationSubscription.cancel();
    this._brakingSubscription.cancel();
    this._afterBrakingSubscription.cancel();

    this.commandSystem.unregister();
    this.movementSystem.unregister();
    this.renderSystem.unregister();
    this.portalSystem.unregister();
    this.symbolPlacementSystem.unregister();
    this.accelerationSystem.unregister();
    this.brakingSystem.unregister();
    this.afterBrakingSystem.unregister();
    this.beforeBrakingSystem.unregister();
    this.checkIconSystem.unregister();
    this.animationSystem.unregister();
  }

  RemoveEntitiesByFilter(markers: string[]): void {
    const indexes = markers.map((marker) => this.entityEngine.getComponentIndex(marker));
    const filter = this.entityEngine.getFilterByIndex(indexes);
    const entities = this.entityEngine.getEntities(filter);

    entities.list.forEach((e) => {
      e.unregister();
    });
  }

  CreateEntity(reelIndex: number, lineIndex: number, drawbleId: number, markers: string[]): Entity {
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
    markers.forEach((m) => entity.addComponent(m, true));

    return entity;
  }

  GetEntity(
    reelIndex: number,
    lineIndex: number,
    drawbleId: number,
    marker: string
  ): Entity | null {
    const index = this.entityEngine.getComponentIndex(marker);
    const wildFilter = this.entityEngine.getFilterByIndex([
      index,
      this.entityEngine.getComponentIndex(marker),
    ]);
    const lineIdx = this.entityEngine.getComponentIndex(ComponentNames.LineIndex);
    const reelIdx = this.entityEngine.getComponentIndex(ComponentNames.ReelIndex);
    const drawIdx = this.entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
    const wilds = this.entityEngine.getEntities(wildFilter);

    for (const wild of wilds.list) {
      const reel = wild.get(reelIdx) as number;
      const line = wild.get(lineIdx) as number;
      const draw = wild.get(drawIdx) as number;
      if (reelIndex === reel && line === lineIndex && draw === drawbleId) {
        return wild;
      }
    }
    return null;
  }

  update(dt: number): void {
    this.entityEngine.update(dt);
  }

  playStopReelSound(reel: number): void {
    if (this.skipStopSounOnReels && this.skipStopSounOnReels.includes(reel)) {
      return;
    }
    if (this._useSounds && !this._stoppedReels.includes(reel)) {
      this._stoppedReels.push(reel);
      this._reelsSoundModel.stopReelSound.stop();
      this._reelsSoundModel.stopReelSound.play();
    }
  }

  getReelByPosition(pos: number): number {
    return this.iconAnimationHelper.getReelIndex(pos);
  }

  getLineByPosition(pos: number): number {
    return this.iconAnimationHelper.getLineIndex(pos);
  }

  getPosition(reel: number, line: number): number {
    return this.iconAnimationHelper.getPosition(reel, line);
  }

  getInitialIcons(): number[][] {
    return this.iconsEnumerator.initialReels;
  }

  disableBlureIconsOnReel(reel: number, useStaticIcons: boolean = true): void {
    const reelIdx = this.entityEngine.getComponentIndex(ComponentNames.ReelIndex);
    const filter = this.entityEngine.getFilterByIndex([reelIdx]);
    const entities = this.entityEngine.getEntities(filter);
    for (const entity of entities.list) {
      const reelEntity = entity.get(reelIdx) as number;
      if (reelEntity === reel) {
        if (useStaticIcons) {
          entity.addComponent(ComponentNames.DisableBlureIconIndex, true);
        } else {
          entity.removeComponent(ComponentNames.DisableBlureIconIndex);
        }
      }
    }
  }
}
