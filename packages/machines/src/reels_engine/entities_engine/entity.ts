import { ComponentIndex } from './component_index';
import { EntitiesEngine } from './entities_engine';
import { EntitiesFilter, FilterMask } from './entities_filter';

export class Entity {
  private _components: any[];
  private readonly _filter: EntitiesFilter = new EntitiesFilter(new FilterMask(0, 0));
  private readonly _oldFilter: EntitiesFilter = new EntitiesFilter(new FilterMask(0, 0));
  private entitiesEngine: EntitiesEngine;

  constructor(entitiesEngine: EntitiesEngine) {
    this.entitiesEngine = entitiesEngine;
    this._components = [];
    for (let i = 0; i < entitiesEngine.componentCount; i++) {
      this._components.push(null);
    }
  }

  get filter(): EntitiesFilter {
    return this._filter;
  }

  set filter(value: EntitiesFilter) {
    if (this._filter !== value) {
      this._oldFilter.mask.mask1 = this._filter.mask.mask1;
      this._oldFilter.mask.mask2 = this._filter.mask.mask2;
      this._filter.mask.mask1 = value.mask.mask1;
      this._filter.mask.mask2 = value.mask.mask2;
      this.entitiesEngine.filterChange(this);
    }
  }

  get oldFilter(): EntitiesFilter {
    return this._oldFilter;
  }

  hasComponent(index: ComponentIndex): boolean {
    const component = this._components[index.componentIndex];
    return component !== null && component !== undefined;
  }

  get<T>(index: ComponentIndex): T {
    return this._components[index.componentIndex] as T;
  }

  set(index: ComponentIndex, component: any): void {
    this._components[index.componentIndex] = component;
  }

  register(): void {
    this.entitiesEngine.registerEntity(this);
  }

  unregister(): void {
    this.entitiesEngine.unregisterEntity(this);
  }

  addComponent(componentName: string, component: any): ComponentIndex {
    this._oldFilter.mask.mask1 = this._filter.mask.mask1;
    this._oldFilter.mask.mask2 = this._filter.mask.mask2;
    const index: ComponentIndex = this.entitiesEngine.getComponentIndex(componentName);
    const idx: number = index.componentIndex;
    const newMask: FilterMask = new FilterMask(0, 0);
    if (index.componentIndex < 32) {
      newMask.mask1 = 1 << idx;
      newMask.mask2 = this._filter.mask.mask2;
    } else {
      newMask.mask1 = this._filter.mask.mask1;
      newMask.mask2 = 1 << idx % 32;
    }
    this._filter.mask = this._filter.mask.or(newMask);
    this._components[idx] = component;
    if (this.entitiesEngine.getAllEntities().list.includes(this)) {
      this.entitiesEngine.filterChange(this);
    }
    return index;
  }

  removeComponent(componentName: string): void {
    this._oldFilter.mask.mask1 = this._filter.mask.mask1;
    this._oldFilter.mask.mask2 = this._filter.mask.mask2;
    const index: ComponentIndex = this.entitiesEngine.getComponentIndex(componentName);
    const idx: number = index.componentIndex;
    const newMask: FilterMask = new FilterMask(0, 0);
    if (index.componentIndex < 32) {
      newMask.mask1 = ~(1 << idx);
      newMask.mask2 = this._filter.mask.mask2;
    } else {
      newMask.mask1 = this._filter.mask.mask1;
      newMask.mask2 = ~(1 << idx % 32);
    }
    this.filter.mask = this.filter.mask.and(newMask);
    this._components[idx] = null;
    if (this.entitiesEngine.getAllEntities().list.includes(this)) {
      this.entitiesEngine.filterChange(this);
    }
  }
}
