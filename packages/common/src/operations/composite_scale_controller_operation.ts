// import { IStreamSubscription, Vector2 } from '@cgs/syd';
// import { ICompositeController } from 'controllers/i_controller';
// import { IControllerFactory } from 'controllers/i_controller_factory';
// import { ScaleInfo } from 'scale_calculator/scale_info';
// import { IOperationContext } from './i_operation_context';
// import { CompositeControllerOperation } from './composite_controller_operation';
//
// class CompositeScaleControllerOperation<
//   TController extends ICompositeController,
//   TResult,
// > extends CompositeControllerOperation<TController, TResult> {
//   private _scaleChangedSub: IStreamSubscription | null;
//
//   get ignorePopupOffset(): boolean {
//     return false;
//   }
//
//   get popupOffset(): Vector2 {
//     return this.context.scaleManager.popupsOffset;
//   }
//
//   constructor(context: IOperationContext, controllerFactory: IControllerFactory) {
//     super(context, controllerFactory);
//   }
//
//   onCreated(): void {
//     super.onCreated();
//     this.startScaling();
//   }
//
//   startScaling(): void {
//     // _scaleChangedSub = context.scaleManager.lobbyScaler.addScaleChangedListener((info) => {
//     //   this.onScale(info);
//     // });
//   }
//
//   onScale(info: ScaleInfo): void {
//     this.viewController.view.scale = info.scale.clone();
//     this.viewController.view.position = info.position
//       .clone()
//       .add(this.ignorePopupOffset ? Vector2.Zero : this.popupOffset.multiply(info.scale));
//   }
//
//   stopScaling(): void {
//     this._scaleChangedSub?.cancel();
//     this._scaleChangedSub = null;
//   }
//
//   finishExecution(): Promise<any> {
//     this.stopScaling();
//     return super.finishExecution();
//   }
// }
