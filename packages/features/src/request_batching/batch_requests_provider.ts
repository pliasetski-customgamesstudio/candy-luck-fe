// import { Completer } from "@cgs/common";
// import { Future } from 'dart:async';
// import { Log } from "@cgs/network";
// import { Log } from "@cgs/shared";
// import { Log } from 'syd/syd';
//
// class BatchRequestsProvider implements IBatchRequestsProvider {
//   private _requestBatchingService: IRequestBatchingService;
//   private _clientProperties: IClientProperties;
//   private _batchInfo: { [key: string]: any };
//   private _batchInfoRequested: string[];
//   private _batchInfoCompleted: Completer<boolean>;
//
//   constructor(requestBatchingService: IRequestBatchingService, clientProperties: IClientProperties) {
//     this._requestBatchingService = requestBatchingService;
//     this._clientProperties = clientProperties;
//   }
//
//   public async tryGetDtoResponse<T>(responseType: Type<T>, address: ServiceAddress, responseFound: Out<boolean>): Promise<T> {
//     if (this._batchInfo && Object.keys(this._batchInfo).length > 0) {
//       const command = address.serviceName.toLowerCase() + "." + address.restPath.toLowerCase();
//       if (this._batchInfo.hasOwnProperty(command) && command) {
//         const strData = this._batchInfo[command];
//         const result = strData && typeof strData === 'object' ? ModelReflection.fromMap(responseType, strData) as T : null;
//         delete this._batchInfo[command];
//         responseFound.setValue(true);
//         return result;
//       } else {
//         Log.Trace("Batch info do not contain: " + address.serviceName + " - " + address.restPath + ". Search command: " + command);
//       }
//     } else if (this._batchInfoCompleted && !this._batchInfoCompleted.isCompleted) {
//       const command = address.serviceName.toLowerCase() + "." + address.restPath.toLowerCase();
//       if (this._batchInfoRequested.includes(command)) {
//         Log.Trace("Batch info found, waiting for response: " + address.serviceName + " - " + address.restPath);
//         await this._batchInfoCompleted.future;
//         Log.Trace("Batch info completed, retrying response: " + address.serviceName + " - " + address.restPath);
//         return this.tryGetDtoResponse<T>(responseType, address, responseFound);
//       } else {
//         Log.Trace("Batch info is empty: " + address.serviceName + " - " + address.restPath);
//       }
//     }
//     responseFound.setValue(false);
//     return null;
//   }
//
//   public initBatchRequest(): BatchRequest {
//     this._batchInfoRequested = [];
//     this._batchInfoCompleted = new Completer<boolean>();
//     return { commandNames: [] };
//   }
//
//   public async updateBatchInfo(request: BatchRequest): Promise<void> {
//     for (const command of request.commandNames) {
//       this._batchInfoRequested.push(command);
//     }
//   }
// }
