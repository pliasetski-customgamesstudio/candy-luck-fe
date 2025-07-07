// import { BatchRequest } from '@cgs/network';
//
// export interface IBatchSupport {
//   updateBatchRequest(request: BatchRequest): void;
// }
//
// export interface IBatchRequestsProvider {
//   tryGetDtoResponse<T>(
//     responseType: Type<T>,
//     address: ServiceAddress,
//     responseFound: Out<boolean>
//   ): Promise<T>;
//   initBatchRequest(): BatchRequest;
//   updateBatchInfo(request: BatchRequest): Promise<void>;
// }
//
// export abstract class BatchOperationBase extends AsyncOperationBase implements IBatchSupport {
//   constructor(context: IOperationContext) {
//     super(context);
//   }
//
//   updateBatchRequest(request: BatchRequest): void {
//     if (this.shouldExecute() && this.shouldBePartOfBatchRequest) {
//       request.commandNames.push(this.batchCommandName);
//     }
//   }
//
//   abstract get batchCommandName(): string;
//
//   shouldExecute(): boolean {
//     return true;
//   }
//
//   shouldBePartOfBatchRequest: boolean = true;
// }
