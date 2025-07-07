import { Vector2 } from '@cgs/syd';

import { ListSet } from '../utils/list_set';
import { AbstractSystem } from '../entities_engine/abstract_system';
import { ComponentIndex } from '../entities_engine/component_index';
import { InternalReelsConfig } from '../internal_reels_config';
import { Entity } from '../entities_engine/entity';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';

export class BounceWildSystem extends AbstractSystem {
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _positionIndex: ComponentIndex;
  private _bouncingPositionIndex: ComponentIndex;
  private _drawAnimationIndex: ComponentIndex;
  private _config: InternalReelsConfig;
  private _bouncePositionSymbols: ListSet<Entity>;

  constructor(engine: EntitiesEngine, config: InternalReelsConfig) {
    super(engine);
    this._config = config;
    this._reelIndex = engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = engine.getComponentIndex(ComponentNames.LineIndex);
    this._positionIndex = engine.getComponentIndex(ComponentNames.Position);
    this._bouncingPositionIndex = engine.getComponentIndex(ComponentNames.BouncingPosition);
    this._drawAnimationIndex = engine.getComponentIndex(ComponentNames.DrawAnimation);

    const bouncePositionFilter = engine.getFilterByIndex([this._bouncingPositionIndex]);
    this._bouncePositionSymbols = engine.getEntities(bouncePositionFilter);
  }

  updateImpl(_dt: number): void {
    const symbols = this._bouncePositionSymbols.list;
    const arraySize = this._bouncePositionSymbols.list.length;

    for (let i = 0; i < arraySize; i++) {
      if (!symbols[i].hasComponent(this._drawAnimationIndex)) {
        const reelIndex = symbols[i].get<number>(this._reelIndex);
        const lineIndex = symbols[i].get<number>(this._lineIndex);
        const bouncingPosition = symbols[i].get<Vector2>(this._bouncingPositionIndex);
        const position = symbols[i].get<Vector2>(this._positionIndex);
        symbols[i].set(this._reelIndex, reelIndex + bouncingPosition.x);
        symbols[i].set(this._lineIndex, lineIndex + bouncingPosition.y);
        symbols[i].set(
          this._positionIndex,
          new Vector2(
            position.x + this._config.symbolSize.x * bouncingPosition.x,
            position.y + this._config.symbolSize.y * bouncingPosition.y
          )
        );
        symbols[i].removeComponent(ComponentNames.BouncingPosition);
      }
    }
  }
}
