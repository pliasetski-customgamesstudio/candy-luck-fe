// import { EventDispatcher } from "@cgs/common";
// import { SceneResource } from 'syd/syd';
//
// class LoadingScreenResourceLoader implements ILoadingScreenResourceLoader {
//   private static readonly WadExt: string = "xml";
//   private static readonly LoadingScreenDownloadType: string = "LOADINGSCREEN";
//
//   private _downloadTaskCreator: IDownloadTaskCreator;
//   private _downloadHelper: DownloadHelper;
//
//   private _currentTasks: Map<LoadingScreenConfig, DownloadTask> = new Map<LoadingScreenConfig, DownloadTask>();
//
//   private _screenLoadedDispatcher: EventDispatcher<LoadingScreenConfig> = new EventDispatcher<LoadingScreenConfig>();
//   public get screenLoaded(): Stream<LoadingScreenConfig> {
//     return this._screenLoadedDispatcher.eventStream;
//   }
//
//   constructor(downloadTaskCreator: IDownloadTaskCreator, downloadManager: IDownloadManager, downloadHelper: DownloadHelper) {
//     this._downloadTaskCreator = downloadTaskCreator;
//     this._downloadHelper = downloadHelper;
//
//     downloadManager.downloadStateChanged.listen((e: DownloadStateChangedArgs) => this.onDownloadStateChanged(e));
//   }
//
//   private getSceneName(loadingScreenConfig: LoadingScreenConfig): string {
//     return this.getResourceIdFromUrl(this._downloadTaskCreator.substituteUrlTemplateForPopupResource(loadingScreenConfig.sceneUrl)) + "/sceneLoginScreen16x9.object";
//   }
//
//   private onDownloadStateChanged(e: DownloadStateChangedArgs): void {
//     const foundTasks = Array.from(this._currentTasks.values()).filter(t => t === e.task);
//     if (foundTasks.length === 0) {
//       return;
//     }
//
//     const config = Array.from(this._currentTasks.keys())[Array.from(this._currentTasks.values()).indexOf(foundTasks[0])];
//
//     if (e.state === DownloadState.Completed) {
//       this._screenLoadedDispatcher.dispatchEvent(config);
//       this._currentTasks.delete(config);
//     } else if (e.state === DownloadState.Failed) {
//       this._currentTasks.delete(config);
//     }
//   }
//
//   public startDownloadingResource(loadingScreenConfig: LoadingScreenConfig): void {
//     if (!this._currentTasks.has(loadingScreenConfig)) {
//       const download = this.createDownloadTask(loadingScreenConfig);
//       if (!download) {
//         return;
//       }
//
//       if (this._downloadHelper.startDownloadingResource(download)) {
//         this._currentTasks.set(loadingScreenConfig, download);
//         //trackDownloadStarted(loadingScreenConfig);
//       }
//     }
//   }
//
//   public async loadResource(loadingScreenConfig: LoadingScreenConfig): Promise<boolean> {
//     const download = this.createDownloadTask(loadingScreenConfig);
//     if (!download) {
//       return false;
//     }
//
//     if (this._downloadHelper.isLoaded(download)) {
//       return true;
//     }
//     //trackDownloadStarted(loadingScreenConfig);
//     return this._downloadHelper.getDownloadTask(download, true);
//   }
//
//   public deleteResource(loadingScreenConfig: LoadingScreenConfig): void {
//     const download = this.createDownloadTask(loadingScreenConfig);
//     if (download !== null) {
//       this._downloadHelper.removeDownloadingResource(download);
//     }
//   }
//
//   private createDownloadTask(loadingScreenConfig: LoadingScreenConfig): DownloadTask {
//     const uri: string = this._downloadTaskCreator.substituteUrlTemplateForPopupResource(loadingScreenConfig.sceneUrl);
//     const downloadId: string = this.getDownloadId(loadingScreenConfig);
//     return new DownloadTask(new DownloadId(LoadingScreenDownloadType, downloadId), uri, this.getDownloadDestination(loadingScreenConfig));
//   }
//
//   private getDownloadDestination(loadingScreenConfig: LoadingScreenConfig): DownloadDestination {
//     return new DownloadDestination(SceneResource.TypeId, this.getDownloadId(loadingScreenConfig));
//   }
//
//   private getDownloadId(loadingScreenConfig: LoadingScreenConfig): string {
//     return `${LoadingScreenDownloadType}_${loadingScreenConfig.startDate.toString()}_${loadingScreenConfig.endDate.toString()}`
//       .replaceAll(" ", "_").replaceAll(":", "").replaceAll("-", "").replaceAll(".000", "");
//   }
//
// //  void trackDownloadStarted(LoadingScreenConfig loadingScreenConfig) {
// //    _downloadingTimeMeter.StartMetering(createDownloadTask(loadingScreenConfig),
// //    t => _analyticsService.TrackEvent(new LoadingScreenLoadingTimeEvent((int)t.TotalMilliseconds)));
// //  }
//
//   private getResourceIdFromUrl(uri: string): string {
//     const result = uri.split("/");
//     result.splice(result.length - 1, 1);
//     return result[result.length - 1];
//   }
// }
