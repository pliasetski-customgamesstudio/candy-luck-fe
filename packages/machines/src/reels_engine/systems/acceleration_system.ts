import { EventDispatcher, EventStream } from '@cgs/syd';
import { BaseSystem } from './base_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { InternalReelsConfig } from '../internal_reels_config';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';
import { SpeedInterpolation } from '../entity_components/speed_interpolation';

export class AccelerationSystem extends BaseSystem {
  private _speedIndex: ComponentIndex;
  private _speedInterpolationIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _acceleratedLineCount: number[];
  private readonly _config: InternalReelsConfig;
  private readonly _reelAccelerated: EventDispatcher<number>;
  public readonly reelAccelerated: EventStream<number>;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
    this._acceleratedLineCount = new Array<number>(this._config.reelCount).fill(0);
    this._reelAccelerated = new EventDispatcher<number>();
    this.reelAccelerated = this._reelAccelerated.eventStream;
  }

  public getIndexesForFilter(): ComponentIndex[] {
    this._speedInterpolationIndex = this.engine.getComponentIndex(
      ComponentNames.AccelerationInterpolate
    );
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    return [this._speedInterpolationIndex, this._speedIndex, this._reelIndex, this._lineIndex];
  }

  public processEntity(entity: Entity): void {
    const interpolation: SpeedInterpolation = entity.get<SpeedInterpolation>(
      this._speedInterpolationIndex
    );
    if (!interpolation.isDone) {
      entity.set(this._speedIndex, interpolation.value);
      interpolation.step(1.0);
    } else {
      entity.removeComponent(ComponentNames.AccelerationInterpolate);
      this.fireEventIfNeed(entity);
    }
  }

  private fireEventIfNeed(entity: Entity): void {
    const reel: number = entity.get<number>(this._reelIndex) as number;
    if (++this._acceleratedLineCount[reel] >= this._config.lineCount) {
      this._acceleratedLineCount[reel] = 0;
      this._reelAccelerated.dispatchEvent(reel);
    }
  }
}
