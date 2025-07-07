// import { PopupOperation, IOperationContext, IControllerFactory, OperationControllerBase, SceneObject, Node } from "@cgs/common";
// import { VoidType } from "@cgs/shared";
// import { Syd } from 'syd';
//
// class MaintenanceOperation extends PopupOperation<MaintenanceController, MaintenanceView, VoidType> {
//   constructor(context: IOperationContext, controllerFactory: IControllerFactory) {
//     super(context, controllerFactory);
//   }
//
//   handleBackKey(): boolean {
//     this.complete(VoidType.value);
//     return true;
//   }
// }
//
// class MaintenanceController extends OperationControllerBase<MaintenanceOperation, MaintenanceView> {
//   constructor(view: MaintenanceView, operation: MaintenanceOperation) {
//     super(view, operation);
//   }
//
//   onInitialize(): void {
//
//   }
//
//   private _onTryAgain(): void {
//     this.operation.complete(VoidType.value);
//   }
//
//   private _onClose(): void {
//     this.operation.complete(VoidType.value);
//   }
// }
//
// class MaintenanceView extends SceneObject {
//   constructor(root: Node) {
//     super();
//   }
// }
