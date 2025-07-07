// import { AsyncOperationBase } from "@cgs/common";
// import { IBatchSupport, BatchRequest, IOperation, IOperationContext } from "@cgs/network";
//
// abstract class CompositeBatchSupportOperation extends AsyncOperationBase implements IBatchSupport {
//   private _operations: IOperation[];
//
//   constructor(context: IOperationContext) {
//     super(context);
//   }
//
//   updateBatchRequest(request: BatchRequest): void {
//     for (const batchSupport of this.getOperations().filter(op => op instanceof IBatchSupport).map(op => op as IBatchSupport)) {
//       batchSupport.updateBatchRequest(request);
//     }
//   }
//
//   getOperations(): IOperation[] {
//     if (this._operations) {
//       return this._operations;
//     }
//
//     this._operations = this.initOperations();
//     return this._operations;
//   }
//
//   abstract initOperations(): IOperation[];
// }
