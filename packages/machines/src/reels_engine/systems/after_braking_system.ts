import { EventDispatcher, EventStream } from '@cgs/syd';
import { BaseSystem } from './base_system';
import { IconEnumerator } from '../icon_enumerator';
import { ComponentIndex } from '../entities_engine/component_index';
import { InternalReelsConfig } from '../internal_reels_config';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export class AfterBrakingSystem extends BaseSystem {
  private _enumerator: IconEnumerator;
  get enumerator(): IconEnumerator {
    return this._enumerator;
  }
  private _afterBrakingindex: ComponentIndex;
  private _finalPositionIndex: ComponentIndex;
  get finalPositionIndex(): ComponentIndex {
    return this._finalPositionIndex;
  }
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _lineIndex: ComponentIndex;
  get lineIndex(): ComponentIndex {
    return this._lineIndex;
  }
  private _positionIndex: ComponentIndex;
  get positionIndex(): ComponentIndex {
    return this._positionIndex;
  }
  private _posInReelIndex: ComponentIndex;
  get posInReelIndex(): ComponentIndex {
    return this._posInReelIndex;
  }
  private _finalEnumerationIndex: ComponentIndex;
  get finalEnumerationIndex(): ComponentIndex {
    return this._finalEnumerationIndex;
  }
  private _enumerationIndex: ComponentIndex;
  get enumerationIndex(): ComponentIndex {
    return this._enumerationIndex;
  }
  private _drawableIndex: ComponentIndex;
  get drawableIndex(): ComponentIndex {
    return this._drawableIndex;
  }
  private _previousDrawIndex: ComponentIndex;
  get previousDrawIndex(): ComponentIndex {
    return this._previousDrawIndex;
  }
  private _config: InternalReelsConfig;
  private _entityStopped: EventDispatcher<number[]>;
  get entityStopped(): EventStream<number[]> {
    return this._entityStopped.eventStream;
  }

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig,
    enumerator: IconEnumerator
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
    this._enumerator = enumerator;
    this._entityStopped = new EventDispatcher<number[]>();
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._afterBrakingindex = this.engine.getComponentIndex(ComponentNames.AfterBraking);
    this._finalPositionIndex = this.engine.getComponentIndex(ComponentNames.FinalPosition);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._posInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    this._finalEnumerationIndex = this.engine.getComponentIndex(
      ComponentNames.FinalEnumerationIndex
    );
    this._enumerationIndex = this.engine.getComponentIndex(ComponentNames.EnumerationIndex);
    this._drawableIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._previousDrawIndex = this.engine.getComponentIndex('PreviousDrawableIndex');
    return [
      this._afterBrakingindex,
      this._finalPositionIndex,
      this._positionIndex,
      this._reelIndex,
    ];
  }

  processEntity(entity: Entity): void {
    entity.removeComponent(ComponentNames.BrakingInterpolate);
    entity.removeComponent(ComponentNames.Speed);
    entity.removeComponent(ComponentNames.RelocatedFlag);
    entity.set(this._positionIndex, entity.get(this._finalPositionIndex));
    const reel: number = entity.get<number>(this._reelIndex);
    const line: number = entity.get(this._posInReelIndex);
    const enumerationId: number = entity.get(this._finalEnumerationIndex);
    const drawableId: number = this._enumerator.getNext(reel, enumerationId) as number;
    entity.set(this._enumerationIndex, enumerationId);
    if (entity.hasComponent(this._previousDrawIndex)) {
      entity.set(this._previousDrawIndex, drawableId);
    } else {
      entity.set(this._drawableIndex, drawableId);
    }
    entity.set(this._lineIndex, line);
    this.fireStopEvent(entity, reel, line);
    entity.removeComponent(ComponentNames.FinalPosition);
    entity.removeComponent(ComponentNames.PositionInReel);
    entity.removeComponent(ComponentNames.AfterBraking);
    entity.removeComponent(ComponentNames.FinalEnumerationIndex);
    entity.removeComponent(ComponentNames.CalculationReadyFlag);
    entity.removeComponent(ComponentNames.SingleSpinningIndex);
  }

  addToCache(reel: number, line: number, entity: Entity): void {
    this.entityCacheHolder.replaceEntities(reel, line, [entity]);
  }

  fireStopEvent(entity: Entity, reel: number, line: number): void {
    this._entityStopped.dispatchEvent([reel, line]);
  }
}
