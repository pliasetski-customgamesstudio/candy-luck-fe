// import {
//   ISafeHandlerContainer,
//   OperationControllerBase
// } from "@cgs/common";
// import {EventStream, IDisposable, SceneObject} from "@cgs/syd";
// import {IOperation} from "@cgs/common";
// import {IControllerMode} from "@cgs/common";
// import {Func0} from "../../../../shared/lib/src/func/func";
//
// abstract class ControllerMode<TController extends OperationControllerBase<TOperation, TView>, TView extends SceneObject, TOperation extends IOperation>
//     implements IControllerMode, ISafeHandlerContainer {
//   private _controller: TController;
//   private _handlers: IDisposable[] = [];
//
//   constructor(controller: TController) {
//     this._controller = controller;
//   }
//
//   get controller(): TController {
//     return this._controller;
//   }
//
//   get view(): TView {
//     return this._controller.view;
//   }
//
//   get operation(): TOperation {
//     return this._controller.operation;
//   }
//
//   destroy(): void {}
//
//   async enter(): Promise<void> {
//   }
//
//   async exit(): Promise<void> {
//   }
//
//   initialize(): void {}
//
//   setup(): void {}
//
//   setupEventHandler(subscribeStream: EventStream<void>, handlerCreateFunc: () => Promise<void>, once: boolean = false, minSpan: number = 0): void {
//     const unsubscribe = this.controller.createSafeEventHandler(subscribeStream, handlerCreateFunc, once, minSpan);
//     this._handlers.push(unsubscribe);
//   }
//
//   tearDown(): void {
//     for (const safeEventHandler of this._handlers) {
//       safeEventHandler.dispose();
//     }
//     this._handlers = [];
//   }
// }
