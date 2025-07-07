import { AbstractSystem } from '../entities_engine/abstract_system';
import { Entity } from '../entities_engine/entity';
import { ListSet } from '../utils/list_set';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';

export class SubstituteIconSystem extends AbstractSystem {
  private _entities: ListSet<Entity> = new ListSet();
  private _drawableIndex: ComponentIndex;
  private _substituteIconIndex: ComponentIndex;

  constructor(engine: EntitiesEngine) {
    super(engine);
    this._drawableIndex = engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._substituteIconIndex = engine.getComponentIndex(ComponentNames.SubstituteIcon);
    const filter = engine.getFilterByIndex([this._drawableIndex, this._substituteIconIndex]);
    this._entities = engine.getEntities(filter);
  }

  public updateImpl(_dt: number): void {
    const entities = this._entities.list;
    for (let i = 0; i < entities.length; i++) {
      const substituteId = entities[i].get(this._substituteIconIndex);
      if (substituteId !== null && substituteId !== undefined) {
        entities[i].set(this._drawableIndex, substituteId);
        entities[i].removeComponent(ComponentNames.SubstituteIcon);
      }
    }
  }
}
