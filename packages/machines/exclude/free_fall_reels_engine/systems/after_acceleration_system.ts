import { EventDispatcher, EventStream } from 'package:syd/syd';
import {
  BaseSystem,
  EntitiesEngine,
  Entity,
  EntityCacheHolder,
} from 'package:machines/src/reels_engine_library';

class AfterAccelerationSystem extends BaseSystem {
  private _indexesForFilter: ComponentIndex[];
  private _relocatedFlagIndex: ComponentIndex;
  private _positionIndex: ComponentIndex;
  private _speedIndex: ComponentIndex;
  private _reelsConfig: InternalReelsConfig;
  private _acceleratedLineCount: number[];
  private _reelIndex: ComponentIndex;
  private readonly _reelFalled: EventDispatcher<number> = new EventDispatcher<number>();
  public readonly reelFalled: EventStream<number> = this._reelFalled.eventStream;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    reelsConfig: InternalReelsConfig,
    indexesForFilter: ComponentIndex[]
  ) {
    super(engine, entityCacheHolder);
    this._indexesForFilter = indexesForFilter;
    this._positionIndex = engine.getComponentIndex(ComponentNames.Position);
    this._reelIndex = engine.getComponentIndex(ComponentNames.ReelIndex);
    this._relocatedFlagIndex = engine.getComponentIndex(ComponentNames.RelocatedFlag);
    this._speedIndex = engine.getComponentIndex(ComponentNames.Speed);
    this._acceleratedLineCount = new Array<number>(reelsConfig.reelCount).fill(0);
  }

  public processEntity(entity: Entity): void {
    const relocated: number = entity.get(this._relocatedFlagIndex);

    if (relocated !== 0) {
      entity.set(this._speedIndex, Vector2.Zero);
      const position: Vector2 = entity.get<Vector2>(this._positionIndex);
      position.y = this._reelsConfig.offset.y - 2 * this._reelsConfig.symbolSize.y;
      entity.set(this._positionIndex, position);
      entity.removeComponent(ComponentNames.AccelerationInterpolate);
      this.fireEventIfNeed(entity);
    }
  }

  private fireEventIfNeed(entity: Entity): void {
    const reel: number = entity.get<number>(this._reelIndex);
    if (++this._acceleratedLineCount[reel] >= this._reelsConfig.lineCount) {
      this._acceleratedLineCount[reel] = 0;
      this._reelFalled.dispatchEvent(reel);
    }
  }

  public getIndexesForFilter(): ComponentIndex[] {
    return this._indexesForFilter;
  }
}
