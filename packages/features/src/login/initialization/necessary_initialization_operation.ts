// import { InitUserInfoOperation } from "@cgs/common";
//
// class NecessaryInitializationOperation extends CompositeBatchSupportOperation {
//   constructor(context: IOperationContext) {
//     super(context);
//   }
//
//   initOperations(): IOperation[] {
//     return [
//       this.context.initOperation(InitUserInfoOperation)
//     ];
//   }
//
//   async internalExecute(): Promise<void> {
//     await Promise.all(this.getOperations().map((op) => this.context.startOperation(op)));
//   }
// }
