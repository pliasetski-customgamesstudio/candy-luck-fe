// import { PopupOperation, IOperationContext, IControllerFactory, OperationControllerBase, OverlayButtonCreator, IClientProperties, ICustomerSupport, SceneObject, Node } from "@cgs/common";
// import { VoidType } from "@cgs/shared";
// import { ServerErrorController } from './ServerErrorController';
//
// export class ServerErrorOperation extends PopupOperation<ServerErrorController, ServerErrorView, VoidType> {
//
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
// export class ServerErrorController extends OperationControllerBase<ServerErrorOperation, ServerErrorView> {
//
//   private _overlayButtonCreator: OverlayButtonCreator;
//   private _clientProperties: IClientProperties;
//   private _customerSupport: ICustomerSupport;
//
//   constructor(view: ServerErrorView, operation: ServerErrorOperation, overlayButtonCreator: OverlayButtonCreator,
//     clientProperties: IClientProperties, customerSupport: ICustomerSupport) {
//     super(view, operation);
//     this._overlayButtonCreator = overlayButtonCreator;
//     this._clientProperties = clientProperties;
//     this._customerSupport = customerSupport;
//   }
//
//   onInitialize(): void {
//
//   }
//
//   async onSupportButtonClicked(): Promise<void> {
//     await this._customerSupport.open();
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
// export class ServerErrorView extends SceneObject {
//   constructor(root: Node) {
//     super();
//   }
// }
