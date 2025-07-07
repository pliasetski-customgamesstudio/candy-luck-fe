import { IControllerFactory } from './i_controller_factory';
import { IocContainer } from '@cgs/shared';
import { IViewFactory } from '../view/i_view_factory';
import { IClientProperties } from '../services/interfaces/i_client_properties';
import { IModeController } from './mode_operation_controller_base';
import { CompositeChildRegistration, IController } from './i_controller';
import { SceneObject, T_SceneObject } from '@cgs/syd';

export abstract class IBuildingController {
  abstract controllerFactory: IControllerFactory;
}

export class ControllerFactory implements IControllerFactory {
  private _container: IocContainer;
  private _viewFactory: IViewFactory;
  private _clientProperties: IClientProperties;

  constructor(
    container: IocContainer,
    viewFactory: IViewFactory,
    clientProperties: IClientProperties
  ) {
    this._container = container;
    this._viewFactory = viewFactory;
    this._clientProperties = clientProperties;
  }

  create(controllerType: symbol, viewType: symbol, params: object[]): IController {
    const view = this._viewFactory.createView(viewType);
    const controller = this.createController(controllerType, view, params);

    if (controller instanceof IModeController) {
      controller.initModes();
    }

    return controller;
  }

  createWithView(controllerType: symbol, view: SceneObject, params: object[]): IController {
    return this.createController(controllerType, view, params);
  }

  init(controllerType: symbol, viewType: symbol, params: object[]): IController {
    const childView = this._viewFactory.createView(viewType);
    return this.createController(controllerType, childView, params);
  }

  initComposite(controllerType: symbol, params: object[]): IController {
    const root = new SceneObject();
    root.id = 'CompositeContorllerCanvas';
    return this.createController(controllerType, root, params);
  }

  private createController(
    childControllerType: symbol,
    childView: SceneObject,
    params: object[]
  ): IController {
    const child = this._container.resolve(
      childControllerType,
      this.prepareParams(childView, params)
    ) as IController;

    if (child instanceof IModeController) {
      child.initModes();
    }
    if (child instanceof IBuildingController) {
      child.controllerFactory = this;
    }
    if (child.composite) {
      child.composite.initChildren(this._clientProperties);
    }

    return child;
  }

  private prepareParams(view: SceneObject, params: object[]): object[] {
    const result: object[] = [];
    result.push(view);
    result.push(...params);

    return result;
  }

  initCompositeChild(
    childRegistration: CompositeChildRegistration,
    root: SceneObject,
    params: object[]
  ): IController {
    let childView: SceneObject;
    if (childRegistration.useParentView) {
      childView = root;
    } else {
      childView =
        childRegistration.viewType === T_SceneObject
          ? (new SceneObject() as SceneObject)
          : this._viewFactory.createView(childRegistration.viewType);

      if (root.isInitialized) {
        childView.initialize();
      }
      root.addChild(childView);
    }

    return this.createController(childRegistration.childType, childView, params);
  }
}
