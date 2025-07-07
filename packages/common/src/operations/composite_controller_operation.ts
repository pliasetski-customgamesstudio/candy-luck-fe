// import { SceneObject } from '@cgs/syd';
// import { ICompositeController, IControllerView } from 'controllers/i_controller';
// import { IControllerFactory } from 'controllers/i_controller_factory';
// import { IOperationContext } from './i_operation_context';
// import { AsyncOperationWithResultBase } from './operation_with_result_base';
//
// export class CompositeControllerOperation<
//   TController extends ICompositeController,
//   TResult,
// > extends AsyncOperationWithResultBase<TResult> {
//   private _controllerFactory: IControllerFactory;
//   private _controller: TController;
//
//   public get controllerFactory(): IControllerFactory {
//     return this._controllerFactory;
//   }
//
//   public get controller(): TController {
//     return this._controller;
//   }
//
//   public set controller(value: TController) {
//     this._controller = value;
//   }
//
//   public get viewController(): IControllerView<SceneObject> {
//     return this.controller as unknown as IControllerView<SceneObject>;
//   }
//
//   public get ManualSpinner(): boolean {
//     return false;
//   }
//
//   public get ManualFogging(): boolean {
//     return false;
//   }
//
//   constructor(context: IOperationContext, controllerFactory: IControllerFactory) {
//     super(context);
//     this._controllerFactory = controllerFactory;
//   }
//
//   public async finishExecution(): Promise<void> {
//     if (this._controller) {
//       await this._controller.stop();
//       await this.context.viewContext.hide(this.viewController.view, true);
//       await this._controller.afterHide();
//     }
//   }
//
//   public async internalExecute(): Promise<void> {
//     this._controller = await this.initController();
//     this.onCreated();
//
//     this.viewController.view.initialize();
//     await this.controller.initialize();
//
//     await this.context.viewContext.show(
//       this.viewController.view,
//       this.ManualSpinner,
//       this.ManualFogging
//     );
//     await this._controller.start();
//   }
//
//   public onCreated(): void {}
//
//   public async initController(): Promise<TController> {
//     return await this._controllerFactory.initComposite(TController, [this]);
//   }
// }
