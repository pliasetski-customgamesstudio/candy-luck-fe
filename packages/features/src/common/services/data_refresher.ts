// import { RefreshHint } from "@cgs/common";
// import { InitUserInfoOperation } from "@cgs/shared";
// import { Syd } from 'syd/syd';
//
// class RefreshTarget extends Enum<string> {
//   static readonly UserInfo = "userInfo";
//   static readonly GameList = "gameList";
//   static readonly Banners = "banner";
//   static readonly PersonalOffers = "po";
//   static readonly ProgressiveBonus = "progressive";
//   static readonly ClientConfig = "clientConfig";
//   static readonly Default = "default";
//
//   static readonly all = [
//     RefreshTarget.UserInfo, RefreshTarget.GameList, RefreshTarget.Banners,
//     RefreshTarget.PersonalOffers, RefreshTarget.ClientConfig, RefreshTarget.ProgressiveBonus
//   ];
// }
//
// abstract class IDataRefresher {
//   refreshByTarget(context: IOperationContext, target: string): Promise<void>;
//   refreshByTargets(context: IOperationContext, targets: string[]): Promise<void>;
//   refreshByHint(context: IOperationContext, hint: RefreshHint): Promise<void>;
// }
//
// abstract class IDataRefresherConfig {
//   getTargetConfig(target: string): RefreshTargetConfig;
//   getTargetsByHint(hint: RefreshHint): RefreshTargetConfig[];
// }
//
// class RefreshTargetConfig {
//   private _target: string;
//   private _refreshOperationType: Type;
//   private _refreshHints: RefreshHint[];
//
//   get target(): string {
//     return this._target;
//   }
//   set target(value: string) {
//     this._target = value;
//   }
//
//   get refreshOperationType(): Type {
//     return this._refreshOperationType;
//   }
//   set refreshOperationType(value: Type) {
//     this._refreshOperationType = value;
//   }
//
//   get refreshHints(): RefreshHint[] {
//     return this._refreshHints;
//   }
//   set refreshHints(value: RefreshHint[]) {
//     this._refreshHints = value;
//   }
//
//   constructor(target: string, refreshOperationType: Type, refreshHints: RefreshHint[]) {
//     this._target = target;
//     this._refreshOperationType = refreshOperationType;
//     this._refreshHints = refreshHints;
//   }
//
//   static readonly AllHints = [RefreshHint.backToLobby, RefreshHint.defaultHint];
//   static readonly AllHintsExceptRelogin = [RefreshHint.backToLobby, RefreshHint.defaultHint];
// }
//
// export class DataRefresherConfig implements IDataRefresherConfig {
//   private readonly _targetConfigurations: RefreshTargetConfig[] = [
//     new RefreshTargetConfig(RefreshTarget.UserInfo, InitUserInfoOperation, RefreshTargetConfig.AllHints),
//   ];
//
//   getTargetConfig(target: string): RefreshTargetConfig {
//     return this._targetConfigurations.find(config => config.target === target);
//   }
//
//   getTargetsByHint(hint: RefreshHint): RefreshTargetConfig[] {
//     return this._targetConfigurations.filter(config => config.refreshHints.includes(hint));
//   }
// }
//
// class DataRefresher implements IDataRefresher {
//   private readonly _dataRefresherConfig: IDataRefresherConfig;
//   private readonly _batchRequestsProvider: IBatchRequestsProvider;
//
//   constructor(dataRefresherConfig: IDataRefresherConfig, batchRequestsProvider: IBatchRequestsProvider) {
//     this._dataRefresherConfig = dataRefresherConfig;
//     this._batchRequestsProvider = batchRequestsProvider;
//   }
//
//   async refreshByHint(context: IOperationContext, hint: RefreshHint): Promise<void> {
//     const operations = this._dataRefresherConfig.getTargetsByHint(hint)
//       .map(target => context.initOperation(target.refreshOperationType));
//
//     await this.batchRefresh(context, operations);
//   }
//
//   async batchRefresh(context: IOperationContext, operations: IOperation[]): Promise<void> {
//     const batchRequest = this._batchRequestsProvider.initBatchRequest();
//
//     operations.filter(op => op instanceof IBatchSupport).map(op => op as IBatchSupport)
//       .forEach(operation => operation.updateBatchRequest(batchRequest));
//     await this._batchRequestsProvider.updateBatchInfo(batchRequest);
//     await Promise.all(operations.map(op => context.startOperation(op)));
//   }
//
//   async refreshByTargets(context: IOperationContext, targets: string[]): Promise<void> {
//     const operations = targets.map(target => this._dataRefresherConfig.getTargetConfig(target))
//       .filter(targetConfig => targetConfig !== null)
//       .map(target => context.initOperation(target.refreshOperationType));
//
//     await this.batchRefresh(context, operations);
//   }
//
//   async refreshByTarget(context: IOperationContext, target: string): Promise<void> {
//     const targetConfig = this._dataRefresherConfig.getTargetConfig(target);
//     if (targetConfig !== null) {
//       await context.startOperationByType(targetConfig.refreshOperationType);
//     }
//   }
// }
