// import { BatchRequest, BatchingApiService } from "@cgs/network";
// import { ISessionHolder } from "@cgs/common";
// import { TimeZoneFormatter } from "@cgs/shared";
//
// export interface IRequestBatchingService {
//   abstract getBatchInfo(request: BatchRequest): Promise<{ [key: string]: any }>;
// }
//
// class StubRequestBatchingService implements IRequestBatchingService {
//   getBatchInfo(request: BatchRequest): Promise<{ [key: string]: any }> {
//     return Promise.resolve(null);
//   }
// }
//
// class RequestBatchingService implements IRequestBatchingService {
//   private _resolution: string;
//   private _batchingApiService: BatchingApiService;
//   private _sessionHolder: ISessionHolder;
//
//   constructor(
//     batchingApiService: BatchingApiService,
//     sessionHolder: ISessionHolder,
//     coordinateSystemInfo: ICoordinateSystemInfoProvider
//   ) {
//     this._batchingApiService = batchingApiService;
//     this._sessionHolder = sessionHolder;
//     this._resolution = coordinateSystemInfo.heightSize;
//   }
//
//   async getBatchInfo(request: BatchRequest): Promise<{ [key: string]: any }> {
//     const result: { [key: string]: any } = {};
//
//     request.session = this._sessionHolder.sessionToken;
//     request.resolution = this._resolution;
//     request.timeZoneId = TimeZoneFormatter.getFormattedTimeZone();
//
//     const batchInfo = await this._batchingApiService.getBatchInfo(request);
//
//     if (batchInfo?.response) {
//       return Object.fromEntries(batchInfo.response.entries());
//     }
//     return result;
//   }
// }
