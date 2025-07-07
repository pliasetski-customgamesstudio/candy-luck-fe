// import { IDownloadTaskCreator } from "@cgs/common";
// import { Disposable } from 'dart:async';
// import { DownloadTask } from "@cgs/shared";
// import { DownloadManager } from 'syd/syd';
// import { PopupResourceLoader } from 'syd/syd';
//
// abstract class SimpleMeteredResourceLoader<TPopupInfo, TView extends SceneObject> extends PopupResourceLoader<TPopupInfo, TView> implements Disposable {
//   private _viewFactory: IViewFactory;
//   private _downloadTaskCreator: IDownloadTaskCreator;
//   private _startDownloadTime: Date;
//   private _download: DownloadTask;
//   private _streamSubscription: StreamSubscription;
//
//   constructor(
//     downloadManager: DownloadManager,
//     downloadHelper: DownloadHelper,
//     downloadResourceLoader: IDownloadResourceLoader,
//     viewFactory: IViewFactory,
//     downloadTaskCreator: IDownloadTaskCreator
//   ) {
//     super(downloadHelper, downloadResourceLoader);
//     this._viewFactory = viewFactory;
//     this._downloadTaskCreator = downloadTaskCreator;
//     this._streamSubscription = downloadManager.downloadStateChanged.listen((d) => this.onDownloadStateChanged(d));
//   }
//
//   get SceneName(): string {
//     return "scene.object";
//   }
//
//   private _viewLoadedDispatcher: EventDispatcher = new EventDispatcher();
//
//   get viewLoaded(): Stream {
//     return this._viewLoadedDispatcher.eventStream;
//   }
//
//   createPopupView(popupInfo: TPopupInfo): TView {
//     let res = super.createPopupView(popupInfo) as TView;
//     if (!res && !this.onlyCustomView) {
//       res = this._viewFactory.createView(TView) as TView;
//     }
//     return res;
//   }
//
//   get onlyCustomView(): boolean {
//     return false;
//   }
//
//   startLoadingResource(popupInfo: TPopupInfo): void {
//     this._startDownloadTime = new Date();
//     this._download = this.createDownloadTask(popupInfo);
//     super.startLoadingResource(popupInfo);
//   }
//
//   createDownloadTask(popupInfo: TPopupInfo): DownloadTask {
//     let uri = this.getUriTemplate(popupInfo);
//     if (!uri) {
//       return null;
//     }
//     uri = this._downloadTaskCreator.substituteUrlTemplateForPopupResource(uri);
//
//     let resourceId = getResourceIdFromUrlEx(uri, SceneName);
//     let resourceType = TextureResource.TypeId;
//     if (PathUtils.getExtension(uri) == WadExt) {
//       resourceType = syd.SceneResource.TypeId;
//     }
//     return new DownloadTask(
//       new DownloadId(this.downloadType, this.getId(popupInfo)), uri, new DownloadDestination(resourceType, resourceId)
//     );
//   }
//
//   get downloadType(): string {
//     return cacheFolder;
//   }
//
//   getId(popupInfo: TPopupInfo): string {
//     return "1";
//   }
//
//   abstract getUriTemplate(popupInfo: TPopupInfo): string;
//
//   abstract get cacheFolder(): string;
//
//   trackDownloadStarted(popupInfo: TPopupInfo): void {
//   }
//
//   downloadFailed(task: IDownloadTask, duration: Duration): void {
//   }
//
//   downloadSucceeded(task: IDownloadTask, duration: Duration): void {
//   }
//
//   onDownloadStateChanged(e: DownloadStateChangedArgs): void {
//     if (!this._download || this._download != e.task) {
//       return;
//     }
//
//     if (e.state == DownloadState.Failed) {
//       this.downloadFailed(e.task, new Date().getTime() - this._startDownloadTime.getTime());
//     }
//     else if (e.state == DownloadState.Completed) {
//       this.downloadSucceeded(e.task, new Date().getTime() - this._startDownloadTime.getTime());
//       this._viewLoadedDispatcher.dispatchEvent();
//     }
//   }
//
//   dispose(): void {
//     this._streamSubscription?.cancel();
//   }
// }
