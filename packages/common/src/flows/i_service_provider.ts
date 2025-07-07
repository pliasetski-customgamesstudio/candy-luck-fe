export interface IServiceProvider {
  provides(type: symbol): boolean;
  provide(type: symbol): any;
}
