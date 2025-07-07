import { Container } from 'inversify';
import { EntitiesEngine, Entity } from 'machines';
import { IconsSceneObject, IconModel, IconEnumerator } from 'syd';
import {
  ReelsEngine,
  IReelsConfig,
  GameStateMachine,
  ReelsSoundModel,
} from 'machines/src/reels_engine_library';

class CollapseReelsEngine extends ReelsEngine {
  hiddenAnimationEntities: Entity[][];
  hiddenSoundEntities: Entity[][];
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _positionIndex: ComponentIndex;
  private _toRemoveIndex: ComponentIndex;

  constructor(
    container: Container,
    entityEngine: EntitiesEngine,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconModel: IconModel,
    enumerator: IconEnumerator,
    reelConfig: IReelsConfig,
    gameStateMachine: GameStateMachine,
    reelsSoundModel: ReelsSoundModel,
    useSounds: boolean
  ) {
    super(
      container,
      entityEngine,
      iconRender,
      animIconRender,
      iconModel,
      enumerator,
      reelConfig,
      gameStateMachine,
      reelsSoundModel,
      useSounds
    );
    this.initHiddenEntities();

    this._reelIndex = entityEngine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = entityEngine.getComponentIndex(ComponentNames.LineIndex);
    this._positionIndex = entityEngine.getComponentIndex(ComponentNames.Position);
    this._toRemoveIndex = entityEngine.getComponentIndex(ComponentNames.ToRemoveIndex);
  }

  createSystems(): void {
    super.createSystems();

    const indexesForFilter: ComponentIndex[] = [
      entityEngine.getComponentIndex(ComponentNames.BrakingCalculationInfo),
      entityEngine.getComponentIndex(ComponentNames.ReelIndex),
      entityEngine.getComponentIndex(ComponentNames.FreeFallingIcon),
    ];
    const freeFallBrakingSystem = new FreeFallBeforeBrakingSystem(
      entityEngine,
      entityCacheHolder,
      internalConfig,
      iconsEnumerator,
      indexesForFilter
    );
    freeFallBrakingSystem.updateOrder = beforeBrakingSystem.updateOrder - 10;
    freeFallBrakingSystem.register();
  }

  stopEntity(reel: number, line: number, winIndex: number): void {
    iconsEnumerator.setWinIndex(reel, line, winIndex);
    commandSystem.stopEntity(reel, line);
  }

  hideAnimEntity(entity: Entity): void {
    const reel = entity.get(entityEngine.getComponentIndex(ComponentNames.ReelIndex));
    if (!entity.get(this._toRemoveIndex)) {
      this.hiddenAnimationEntities[reel].push(entity);
    }

    entity.addComponent(ComponentNames.Speed, Vector2.Zero.clone());
    entity.addComponent(ComponentNames.RelocatedFlag, 1);
    entity.addComponent(ComponentNames.FreeFallingIcon, true);
    const position = entity.get<Vector2>(this._positionIndex);
    position.y = internalConfig.offset.y - internalConfig.symbolSize.y;
    entity.set(this._positionIndex, position);
    entity.set(this._lineIndex, -1);
  }

  hideSoundEntity(entity: Entity): void {
    const reel = entity.get(entityEngine.getComponentIndex(ComponentNames.ReelIndex));
    if (!entity.get(this._toRemoveIndex)) {
      this.hiddenSoundEntities[reel].push(entity);
    }

    entity.addComponent(ComponentNames.Speed, Vector2.Zero.clone());
    entity.addComponent(ComponentNames.RelocatedFlag, 1);
    entity.addComponent(ComponentNames.FreeFallingIcon, true);
    const position = entity.get<Vector2>(this._positionIndex);
    position.y = internalConfig.offset.y - internalConfig.symbolSize.y;
    entity.set(this._positionIndex, position);
    entity.set(this._lineIndex, -1);
  }

  moveEntityTo(
    entity: Entity,
    toLine: number,
    speed: Vector2,
    duration: number,
    easing: Easing
  ): void {
    const line = entity.get<number>(this._lineIndex);
    if (line >= 0 && line < ReelConfig.lineCount) {
      stablePositions[entity.get<number>(this._reelIndex)][line] = false;
    }
    if (toLine >= 0 && toLine < ReelConfig.lineCount) {
      stablePositions[entity.get<number>(this._reelIndex)][toLine] = false;
    }

    const position = entity.get<Vector2>(this._positionIndex);
    const endSpeed = calculateSpeed(speed);
    entity.set(this._lineIndex, toLine);
    entity.addComponent(
      ComponentNames.BrakingCalculationInfo,
      new BrakingCalculationInfo(position, endSpeed)
    );
    entity.addComponent(ComponentNames.FreeFallingIcon, true);
    commandSystem.accelerateEntity(entity, Vector2.Zero.clone(), endSpeed, duration, easing);
  }

  SlotCollapsed(): boolean {
    return stablePositions.filter((reelPos) => reelPos.filter((p) => !p).length !== 0).length === 0;
  }

  private initHiddenEntities(): void {
    this.hiddenAnimationEntities = new Array<Array<Entity>>();

    for (let i = 0; i < internalConfig.reelCount; i++) {
      this.hiddenAnimationEntities.push(new Array<Entity>());
    }

    this.hiddenSoundEntities = new Array<Array<Entity>>();

    for (let i = 0; i < internalConfig.reelCount; i++) {
      this.hiddenSoundEntities.push(new Array<Entity>());
    }
  }
}
