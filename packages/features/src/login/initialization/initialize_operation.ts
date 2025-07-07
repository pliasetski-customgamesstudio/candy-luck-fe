// import { startOperation } from "@cgs/shared";
//
// class InitializeOperation extends CompositeBatchSupportOperation {
//   constructor(context: IOperationContext) {
//     super(context);
//   }
//
//   initOperations(): IOperation[] {
//     let res: IOperation[] = [];
//
//     return res;
//   }
//
//   async internalExecute(): Promise<void> {
//     await Future.wait(getOperations().map((op) => context.startOperation(op)), { eagerError: true });
//   }
// }
