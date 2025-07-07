import { IOperation } from '../operations/i_operation';
import { SceneObject } from '@cgs/syd';
import { OperationControllerBase } from './operation_controller_base';
import {
  CompositeChildRegistration,
  ICompositeController,
  IController,
  IControllerView,
} from './i_controller';
import { IBuildingController } from './controller_factory';
import { IControllerFactory } from './i_controller_factory';
import { IClientProperties } from '../services/interfaces/i_client_properties';

export abstract class CompositeController<TOperation extends IOperation, TView extends SceneObject>
  extends OperationControllerBase<TOperation, TView>
  implements ICompositeController, IBuildingController
{
  get composite(): ICompositeController | undefined {
    return this;
  }

  private _controllerFactory: IControllerFactory;
  private children: Map<symbol, IController> = new Map<symbol, IController>();
  private _childRegistrations: CompositeChildRegistration[] = [];

  constructor(view: TView, operation: TOperation) {
    super(view, operation);
  }

  get controllerFactory(): IControllerFactory {
    return this._controllerFactory;
  }

  set controllerFactory(value: IControllerFactory) {
    this._controllerFactory = value;
  }

  get childRegistrations(): CompositeChildRegistration[] {
    return this._childRegistrations;
  }

  getChild(controller: symbol): IControllerView<TView> | null {
    if (this.children.has(controller)) {
      return this.children.get(controller) as IControllerView<TView>;
    }

    return null;
  }

  getChildren(): IController[] {
    return Array.from(this.children.values());
  }

  async initChildren(_clientProperties: IClientProperties): Promise<void> {
    for (const childRegistration of this.childRegistrations) {
      if (this.children.has(childRegistration.childType)) {
        continue;
      }

      const child = this.initCompositeChild(
        childRegistration,
        this.getRootViewForCompositeChild(
          childRegistration.baseChildType ?? childRegistration.childType
        ),
        this.operation
      );

      this.children.set(childRegistration.baseChildType ?? childRegistration.childType, child);
    }

    return Promise.resolve();
  }

  async checkNewChildren(clientProperties: IClientProperties): Promise<void> {
    await this.initChildren(clientProperties);
    for (const controller of this.children.values()) {
      if (!controller.isInitialized) {
        await controller.initialize();
      }
    }
    for (const controller of this.children.values()) {
      if (!controller.isStarted) {
        await controller.start();
      }
    }
  }

  initCompositeChild(
    childRegistration: CompositeChildRegistration,
    root: SceneObject,
    parameters: TOperation
  ): IController {
    return this._controllerFactory.initCompositeChild(childRegistration, root, [parameters]);
  }

  async onInitializeAsync(): Promise<void> {
    for (const controller of this.children.values()) {
      await controller.initialize();
    }
  }

  async onStartAsync(): Promise<void> {
    for (const controller of this.children.values()) {
      await controller.start();
    }
  }

  async onStopAsync(): Promise<void> {
    for (const controller of this.children.values()) {
      await controller.stop();
    }
  }

  getRootViewForCompositeChild(_childType: symbol): SceneObject {
    return this.view;
  }
}
