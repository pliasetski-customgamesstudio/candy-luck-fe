import { AbstractSystem } from './abstract_system';
import { ComponentIndex } from './component_index';
import { EntitiesFilter, FilterMask } from './entities_filter';
import { Entity } from './entity';
import { ListSet } from '../utils/list_set';

export class EntitiesEngine {
  private _lastComponentIndex: number = 0;
  public readonly componentCount: number;
  private readonly _entitiesMap: Map<EntitiesFilter, ListSet<Entity>> = new Map<
    EntitiesFilter,
    ListSet<Entity>
  >();
  private readonly _allEntities: ListSet<Entity> = new ListSet<Entity>();
  private readonly _componentIndexes: Map<string, number> = new Map<string, number>();
  public readonly systems: SystemsCollections = new SystemsCollections();

  constructor(componentCount: number) {
    this.componentCount = componentCount;
  }

  public getComponentIndex(componentName: string): ComponentIndex {
    let index = this._componentIndexes.get(componentName);
    if (index === undefined) {
      this._componentIndexes.set(componentName, this._lastComponentIndex);
      index = this._lastComponentIndex;
      this._lastComponentIndex++;
    }
    return new ComponentIndex(index, componentName);
  }

  private getFilterByName(componentNames: string[]): EntitiesFilter {
    const filter = new EntitiesFilter(new FilterMask(0, 0));
    componentNames.forEach((name) => {
      const index = this.getComponentIndex(name);
      const newMask = new FilterMask(0, 0);
      if (index.componentIndex < 32) {
        newMask.mask1 = 1 << index.componentIndex;
      } else {
        newMask.mask2 = 1 << index.componentIndex % 32;
      }
      filter.mask = filter.mask.or(newMask);
    });
    return filter;
  }

  public getFilterByIndex(componentIndexes: ComponentIndex[]): EntitiesFilter {
    const filter = new EntitiesFilter(new FilterMask(0, 0));
    componentIndexes.forEach((index) => {
      const newMask = new FilterMask(0, 0);
      if (index.componentIndex < 32) {
        newMask.mask1 = 1 << index.componentIndex;
      } else {
        newMask.mask2 = 1 << index.componentIndex % 32;
      }
      filter.mask = filter.mask.or(newMask);
    });
    return filter;
  }

  public getEntities(filter: EntitiesFilter): ListSet<Entity> {
    let entitiesCollection = this._entitiesMap.get(filter);
    if (!entitiesCollection) {
      entitiesCollection = new ListSet<Entity>();
      this._entitiesMap.set(filter, entitiesCollection);
      this._allEntities.forEach((entity) => {
        if (entity.filter.mask.and(filter.mask).equals(filter.mask)) {
          entitiesCollection!.add(entity);
        }
      });
    }
    return entitiesCollection;
  }

  public getAllEntities(): ListSet<Entity> {
    return this._allEntities;
  }

  public registerEntity(entity: Entity): void {
    this._allEntities.add(entity);
    this._entitiesMap.forEach((entitiesCollection, filter) => {
      if (entity.filter.mask.and(filter.mask).equals(filter.mask)) {
        entitiesCollection.add(entity);
      }
    });
  }

  public unregisterEntity(entity: Entity): void {
    this._allEntities.remove(entity);
    this._entitiesMap.forEach((entitiesCollection, filter) => {
      if (entity.filter.mask.and(filter.mask).equals(filter.mask)) {
        entitiesCollection.remove(entity);
      }
    });
  }

  public filterChange(entity: Entity): void {
    if (entity.oldFilter.mask.lessThan(entity.filter.mask)) {
      this._componentAdded(entity);
    } else {
      this._componentRemoved(entity);
    }
  }

  private _componentAdded(entity: Entity): void {
    const mask = entity.filter.mask.xor(entity.oldFilter.mask);
    this._entitiesMap.forEach((entitiesCollection, filter) => {
      if (entity.filter.mask.and(filter.mask).equals(filter.mask)) {
        if (!filter.mask.and(mask).equals(new FilterMask(0, 0))) {
          entitiesCollection.add(entity);
        }
      }
    });
  }

  private _componentRemoved(entity: Entity): void {
    const mask = entity.filter.mask.xor(entity.oldFilter.mask);
    this._entitiesMap.forEach((entitiesCollection, filter) => {
      if (entity.oldFilter.mask.and(filter.mask).equals(filter.mask)) {
        if (!filter.mask.and(mask).equals(new FilterMask(0, 0))) {
          entitiesCollection.remove(entity);
        }
      }
    });
  }

  public update(dt: number): void {
    this.systems.innerCollection.forEach((s) => s.update(dt));
  }
}

export class SystemsCollections {
  private readonly _systems: AbstractSystem[] = [];
  private _isValidOrder: boolean = true;

  public invalidateOrder(): void {
    this._isValidOrder = false;
  }

  public get innerCollection(): AbstractSystem[] {
    if (!this._isValidOrder) {
      this._systems.sort((l, r) => l.updateOrder - r.updateOrder);
    }
    return this._systems;
  }

  public add(system: AbstractSystem): void {
    console.log('Entity engine: add system');
    this._systems.push(system);
  }

  public remove(system: AbstractSystem): void {
    const index = this._systems.indexOf(system);
    if (index !== -1) {
      this._systems.splice(index, 1);
    }
  }

  public clear(): void {
    this._systems.length = 0;
  }
}
