// import { IFlowAction } from "@cgs/common";
//
// class LoadingScreenDownloadAction implements IFlowAction {
//   private _loadingScreenManager: ILoadingScreenManager;
//
//   constructor(loadingScreenManager: ILoadingScreenManager) {
//     this._loadingScreenManager = loadingScreenManager;
//   }
//
//   async execute(environment: IExecutionEnvironment): Promise<void> {
//     this._loadingScreenManager.updateLoadingScreens();
//     this._loadingScreenManager.updateBackgroundUrl();
//     return Promise.resolve();
//   }
// }
//
// @FlowAction(LoadingScreenActions.DownloadLoadingScreen)
// export default LoadingScreenDownloadAction;
