import { CompositeChildRegistration, IController } from './i_controller';
import { SceneObject } from '@cgs/syd';

export const T_IControllerFactory = Symbol('IControllerFactory');
export interface IControllerFactory {
  initComposite(controllerType: symbol, params: object[]): IController;
  initCompositeChild(
    childRegistration: CompositeChildRegistration,
    view: SceneObject,
    params: object[]
  ): IController;

  create(controllerType: symbol, viewType: symbol, params: object[]): IController;
  init(controllerType: symbol, viewType: symbol, params: object[]): IController;
  createWithView(controllerType: symbol, view: SceneObject, params: object[]): IController;
}
