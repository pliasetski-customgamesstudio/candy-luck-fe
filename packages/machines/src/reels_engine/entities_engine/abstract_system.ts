import { EntitiesEngine } from './entities_engine';

export abstract class AbstractSystem {
  private _updateOrder: number = 0;
  public engine: EntitiesEngine;

  constructor(engine: EntitiesEngine) {
    this.engine = engine;
  }

  get updateOrder(): number {
    return this._updateOrder;
  }

  set updateOrder(value: number) {
    this._updateOrder = value;
    this.engine.systems.invalidateOrder();
  }

  register(): void {
    this.engine.systems.add(this);
  }

  unregister(): void {
    this.engine.systems.remove(this);
  }

  update(dt: number): void {
    this.updateImpl(dt);
  }

  abstract updateImpl(dt: number): void;
}
