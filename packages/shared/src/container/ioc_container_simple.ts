import { Container, FactoryFunc } from '@cgs/syd';

export const T_IocContainer = Symbol('IocContainer');
export class IocContainer {
  private _container: Container = new Container();

  public get container(): Container {
    return this._container;
  }

  public registerSingleton(type: symbol, singleton?: object): void {
    this._container.registerInstance(singleton).as(type);
  }

  public registerSingletonFactory<T>(type: symbol, factory: FactoryFunc<T>): void {
    this._container.register(factory).singleInstance().as(type);
  }

  public registerFactory<T>(type: symbol, factory: FactoryFunc<T>): void {
    this._container.register(factory).as(type);
  }

  public registerSingletonInstanceAs(abstractions: symbol[], instance: object): void {
    const registrar = this._container.registerInstance(instance);
    for (const type of abstractions) {
      registrar.as(type);
    }
  }

  public registerSingletonFactoryAs<T>(abstractions: symbol[], factory: FactoryFunc<T>): void {
    const registrar = this._container.register(factory).singleInstance();
    for (const type of abstractions) {
      registrar.as(type);
    }
  }

  public registerFactoryAs<T>(abstractions: symbol[], factory: FactoryFunc<T>): void {
    const registrar = this._container.register(factory);
    for (const type of abstractions) {
      registrar.as(type);
    }
  }

  public resolve<T>(type: symbol, positionalArgs?: any[]): T | null {
    return this._container.resolve(type, positionalArgs);
  }
}
