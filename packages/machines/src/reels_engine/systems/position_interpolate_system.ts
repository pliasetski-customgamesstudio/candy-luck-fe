import { InterpolateCopyAction, Vector2 } from '@cgs/syd';
import { BaseSystem } from './base_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { InternalReelsConfig } from '../internal_reels_config';
import { Entity } from '../entities_engine/entity';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ComponentNames } from '../entity_components/component_names';

export class PositionInterpolateSystem extends BaseSystem {
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
  private _positionInterpolateIndex: ComponentIndex;
  get positionInterpolateIndex(): ComponentIndex {
    return this._positionInterpolateIndex;
  }
  private _config: InternalReelsConfig;
  get config(): InternalReelsConfig {
    return this._config;
  }
  private _currentDeltaTime = 0.0;
  get currentDeltaTime(): number {
    return this._currentDeltaTime;
  }

  private _processedEntities: Entity[] = [];
  get processedEntities(): Entity[] {
    return this._processedEntities;
  }

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    config: InternalReelsConfig
  ) {
    super(engine, entityCacheHolder);
    this._config = config;
  }

  isActive(): boolean {
    return this._processedEntities.length > 0;
  }

  processEntity(entity: Entity): void {
    const positionInterpolate: InterpolateCopyAction<Vector2> = entity.get(
      this._positionInterpolateIndex
    );

    if (!positionInterpolate.isDone) {
      if (!this._processedEntities.includes(entity)) {
        this._processedEntities.push(entity);
      }

      positionInterpolate.update(this._currentDeltaTime);
      entity.set(this._positionIndex, positionInterpolate.current);
      const speed = new Vector2(
        0.0,
        -(positionInterpolate.endValue.y - positionInterpolate.startValue.y) /
          positionInterpolate.duration
      );
      this.portalSystem(entity, speed);
    } else {
      entity.removeComponent(ComponentNames.RelocatedFlag);
      entity.removeComponent(ComponentNames.PositionInterpolate);

      entity.removeComponent(ComponentNames.FinalPosition);
      entity.removeComponent(ComponentNames.PositionInReel);
      entity.removeComponent(ComponentNames.AfterBraking);
      entity.removeComponent(ComponentNames.CalculationReadyFlag);
      entity.removeComponent(ComponentNames.FinalEnumerationIndex);
      entity.removeComponent(ComponentNames.BrakingInterpolate);
      entity.removeComponent(ComponentNames.Speed);
      entity.removeComponent(ComponentNames.RelocatedFlag);
      const index = this._processedEntities.indexOf(entity);
      if (index > -1) {
        this._processedEntities.splice(index, 1);
      }
    }
  }

  portalSystem(entity: Entity, velocity: Vector2): void {
    const position = entity.get<Vector2>(this._positionIndex) as Vector2;
    const reelIndex = entity.get<number>(this._reelIndex) as number;
    const offset = this._config.reelsOffset[reelIndex].add(this._config.offset);

    let relocated = 0;

    if (velocity.x > 0 && position.x > this._config.slotSize.x) {
      position.x -= this._config.slotSize.x + this._config.symbolSize.x;
      relocated = 1;
    } else if (velocity.x < 0 && position.x < -this._config.symbolSize.x) {
      position.x += this._config.slotSize.x + this._config.symbolSize.x;
      relocated = -1;
    }

    if (velocity.y > 0 && position.y > this._config.slotSize.y + offset.y) {
      position.y -= this._config.slotSize.y;
      relocated = 1;
    } else if (velocity.y < 0 && position.y < -this._config.symbolSize.y + offset.y) {
      position.y += this._config.slotSize.y;
      relocated = -1;
    }
    entity.addComponent(ComponentNames.RelocatedFlag, relocated);
    entity.set(this._positionIndex, position);
  }

  updateImpl(dt: number): void {
    super.updateImpl(dt);
    this._currentDeltaTime = dt;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._positionInterpolateIndex = this.engine.getComponentIndex(
      ComponentNames.PositionInterpolate
    );
    this._lineIndex = this.engine.getComponentIndex(ComponentNames.LineIndex);
    return [this._positionInterpolateIndex];
  }
}
