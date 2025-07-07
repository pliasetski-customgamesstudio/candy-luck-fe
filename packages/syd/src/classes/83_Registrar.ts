import { Scope } from './53_Scope';

export type ConstructorFunc = new (...args: any[]) => any;
export type FactoryFunc<T> = (container: Container, ...args: any[]) => T;

export class Container {
  public parent: Container | null = null;
  private _registrars: Map<symbol, Registrar> = new Map<symbol, Registrar>();

  get registrars(): Map<symbol, Registrar> {
    return this._registrars;
  }

  register<T>(factory: FactoryFunc<T>): FactoryRegistrar<T> {
    return new FactoryRegistrar<T>(this, factory);
  }

  registerInstance<T>(object: T): InstanceRegistrar<T> {
    return new InstanceRegistrar(this, object);
  }

  resolve<T>(type: symbol, p1?: any): T | null {
    const registrar = this.registrars.get(type) as Registrar<T>;

    if (registrar) {
      return registrar.resolve(p1);
    }

    if (this.parent) {
      return this.parent.resolve(type, p1);
    }

    return null;
  }

  forceResolve<T>(type: symbol, p1?: any): T {
    const registrar = this.registrars.get(type) as Registrar<T>;

    if (registrar) {
      return registrar.resolve(p1);
    }

    const result = this.parent?.forceResolve(type, p1) || null;

    if (result) {
      return result as T;
    } else {
      throw new Error(`Can't resolve type ${type.toString()}`);
    }
  }
}

abstract class Registrar<T = any> {
  protected readonly _container: Container;

  protected constructor(container: Container) {
    this._container = container;
  }

  as(type: symbol): this {
    this._container.registrars.set(type, this);
    return this;
  }

  abstract resolve(p1?: any): T;
}

export class FactoryRegistrar<T> extends Registrar<T> {
  private _factory: any;
  private _scope: Scope = Scope.InstancePerDependency;
  private _instance: T;

  constructor(container: Container, factory: any) {
    super(container);
    this._factory = factory;
  }

  public singleInstance(): this {
    this._scope = Scope.SingleInstance;
    return this;
  }

  public instancePerDependency(): this {
    this._scope = Scope.InstancePerDependency;
    return this;
  }

  public resolve(params: any): T {
    switch (this._scope) {
      case Scope.InstancePerDependency:
        return params === undefined
          ? this._factory(this._container)
          : this._factory(this._container, params);
      default:
        if (!this._instance) {
          this._instance =
            params === undefined
              ? this._factory(this._container)
              : this._factory(this._container, params);
        }

        return this._instance;
    }
  }
}

export class InstanceRegistrar<T> extends Registrar<T> {
  private _instance: T;

  constructor(container: Container, instance: T) {
    super(container);
    this._instance = instance;
  }

  resolve(_: any): T {
    return this._instance;
  }
}
