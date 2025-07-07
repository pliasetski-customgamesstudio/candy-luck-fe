// import { DownloadHelper, IDownloadResourceLoader, IDownloadManager } from "@cgs/shared";
// import { SceneObject } from 'syd/syd';
//
// export interface IPopupResourceLoader<TPopupInfo, TView extends SceneObject> {
//   abstract isLoaded(popupInfo: TPopupInfo): boolean;
//   abstract startLoadingResource(popupInfo: TPopupInfo): void;
//   abstract createPopupView(popupInfo: TPopupInfo): SceneObject;
//   abstract downloadAndCreatePopupView(popupInfo: TPopupInfo): Promise<TView>;
// }
//
// abstract class PopupResourceLoader<TPopupInfo, TView extends SceneObject> implements IPopupResourceLoader<TPopupInfo, TView> {
//   WadExt: string = "xml";
//   abstract downloadHelper: DownloadHelper;
//   abstract _downloadResourceLoader: IDownloadResourceLoader;
//   abstract _downloadManager: IDownloadManager;
//
//   abstract createDownloadTask(popupInfo: TPopupInfo): DownloadTask;
//   createDownloadTaskEx(popupInfo: TPopupInfo, sceneName: string): DownloadTask {
//     return this.createDownloadTask(popupInfo);
//   }
//
//   abstract trackDownloadStarted(popupInfo: TPopupInfo): void;
//   abstract getId(popupInfo: TPopupInfo): string;
//   abstract get downloadType(): string;
//
//   createPopupView(popupInfo: TPopupInfo): SceneObject {
//     return this.innerCreatePopupView(popupInfo, TView, this.SceneName);
//   }
//
//   innerCreatePopupView(popupInfo: TPopupInfo, viewType: any, sceneName: string, sceneShouldExist: boolean = true): SceneObject {
//     const downloadTask = this.createDownloadTask(popupInfo);
//     return this.innerCreatePopupViewWithTask(downloadTask, popupInfo, viewType, sceneName, sceneShouldExist);
//   }
//
//   innerCreatePopupViewWithTask(downloadTask: DownloadTask, popupInfo: TPopupInfo, viewType: any, sceneName: string, sceneShouldExist: boolean = true): SceneObject {
//     if (!downloadTask){
//       return null;
//     }
//     if (this.downloadHelper.isLoaded(downloadTask)) {
//       try {
//         if (downloadTask.destination.resourceType == syd.SceneResource.TypeId) {
//           return this._downloadResourceLoader.loadPopupFromScene(viewType, downloadTask, sceneName, sceneShouldExist);
//         } else {
//           return this._downloadResourceLoader.loadPopupFromTexture(downloadTask, viewType);
//         }
//       } catch (e) {
//         this.onSceneInitializationError(popupInfo, sceneName, e);
//         Logger.Error("Error creating popup view: $downloadTask; sceneName=$sceneName; $e");
//
//         // restartLoadingResource(popupInfo);
//
//         // don't show popup if there are problems loading resource
//         return null;
//       }
//     }
//     return null;
//   }
//
//   onSceneInitializationError(popupInfo: TPopupInfo, sceneName: string, exception: any): void {
//   }
//
//   async downloadAndCreatePopupView(popupInfo: TPopupInfo): Promise<TView> {
//     await this.downloadResource(popupInfo);
//     return this.createPopupView(popupInfo);
//   }
//
//   downloadResource(popupInfo: TPopupInfo): Promise<void> {
//     const download = this.createDownloadTask(popupInfo);
//
//     if (!download) {
//       return Promise.resolve();
//     }
//
//     return this.innerDownloadResource(popupInfo, download);
//   }
//
//   innerDownloadResource(popupInfo: TPopupInfo, download: DownloadTask): Promise<void> {
//     if (!download) {
//       return Promise.resolve();
//     }
//     if(this.downloadHelper.isLoaded(download)){
//       return Promise.resolve();
//     }
//     this.startLoadingResourceEx(popupInfo, download);
//     return this.downloadHelper.getDownloadTask(download);
//   }
//
//   startLoadingResource(popupInfo: TPopupInfo): void {
//     this.startLoadingResourceEx(popupInfo, this.createDownloadTask(popupInfo));
//   }
//
//   startLoadingResourceEx(popupInfo: TPopupInfo, downloadTask: DownloadTask): void {
//     if (!downloadTask) {
//       return;
//     }
//     this.downloadHelper.startDownloadingResource(downloadTask);
//   }
//
//   isLoaded(popupInfo: TPopupInfo): boolean {
//     const downloadTask = this.createDownloadTask(popupInfo);
//     if (!downloadTask) {
//       return false;
//     }
//     return this.downloadHelper.isLoaded(downloadTask);
//   }
//
//   getResourceIdFromUrl(uri: string): string {
//     return this.getResourceIdFromUrlEx(uri, "scene.object");
//   }
//
//   getResourceIdFromUrlEx(uri: string, sceneName: string): string {
//
//     if (PathUtils.getExtension(uri) == this.WadExt) {
//       const result = uri.split("/");
//       result.splice(result.length - 1, 1);
//
//       return result[result.length - 1]/* + "/" + sceneName*/;
//     }
//     else {
//       return PathUtils.getFileName(uri);
//     }
//
//   }
// }
