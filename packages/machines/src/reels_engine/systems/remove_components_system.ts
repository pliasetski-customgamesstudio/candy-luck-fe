import { AbstractSystem } from '../entities_engine/abstract_system';
import { ListSet } from '../utils/list_set';
import { Entity } from '../entities_engine/entity';
import { EntitiesEngine } from '../entities_engine/entities_engine';

export class RemoveComponentsSystem extends AbstractSystem {
  private _wilds: Map<string, ListSet<Entity>> = new Map<string, ListSet<Entity>>();
  private _componentNames: string[] = [];

  constructor(engine: EntitiesEngine, marker: string, componentNames: string[]) {
    super(engine);
    if (componentNames) {
      this._componentNames = componentNames.slice();
    }
    for (const componentName of this._componentNames) {
      const index = engine.getComponentIndex(componentName);

      const wildFilter = engine.getFilterByIndex([index, engine.getComponentIndex(marker)]);

      this._wilds.set(componentName, engine.getEntities(wildFilter));
    }
  }

  updateImpl(_dt: number): void {
    this._wilds.forEach((value, key) => {
      const entities = value.list;
      for (let i = 0; i < entities.length; i++) {
        entities[i].removeComponent(key);
      }
    });
  }
}
