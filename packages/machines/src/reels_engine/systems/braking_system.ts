import { EventDispatcher, Tuple, EventStream } from '@cgs/syd';
import { BaseSystem } from './base_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';
import { SpeedInterpolation } from '../entity_components/speed_interpolation';

export class BrakingSystem extends BaseSystem {
  private _speedInterpolationIndex: ComponentIndex;
  private _speedIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _stopReelAction: any;
  private _directionChange: EventDispatcher<Tuple<number, number>> = new EventDispatcher<
    Tuple<number, number>
  >();
  get directionChange(): EventStream<Tuple<number, number>> {
    return this._directionChange.eventStream;
  }
  private _entityDirectionChange: EventDispatcher<Tuple<number, number>> = new EventDispatcher<
    Tuple<number, number>
  >();
  get entityDirectionChange(): EventStream<Tuple<number, number>> {
    return this._entityDirectionChange.eventStream;
  }

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    stopReelAction: (reel: number) => void
  ) {
    super(engine, entityCacheHolder);
    this._stopReelAction = stopReelAction;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._speedInterpolationIndex = this.engine.getComponentIndex(
      ComponentNames.BrakingInterpolate
    );
    this._speedIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    return [this._speedInterpolationIndex, this._speedIndex];
  }

  processEntity(entity: Entity): void {
    const interpolate: SpeedInterpolation = entity.get(this._speedInterpolationIndex);
    const reel: number = entity.get<number>(this._reelIndex);
    const line: number = entity.get<number>(this._lineIndex);
    if (!interpolate.isDone) {
      const oldVelocity = interpolate.value;
      interpolate.step(1.0);
      entity.set(this._speedIndex, interpolate.value);
      if (oldVelocity.y * interpolate.value.y < 0) {
        this._entityDirectionChange.dispatchEvent(new Tuple(reel, line));
        if (line === 0 && this._stopReelAction) {
          this._directionChange.dispatchEvent(new Tuple(reel, line));
          this._stopReelAction(reel);
        }
      }
    } else {
      entity.addComponent(ComponentNames.AfterBraking, true);
    }
  }
}
