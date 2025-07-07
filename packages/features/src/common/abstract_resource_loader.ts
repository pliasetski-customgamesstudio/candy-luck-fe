// import { IDownloadTaskCreator, IDownloadResourceLoader, DownloadHelper, DownloadTask, DownloadId, DownloadDestination } from "@cgs/common";
// import { StringUtils, PathUtils } from "@cgs/shared";
// import { SceneResource } from 'syd/syd';
//
// export interface AbstractResourceLoader<TView extends SceneObject> extends PopupResourceLoader<string, TView> {
//
//   private _viewFactory: IViewFactory;
//   private _downloadTaskCreator: IDownloadTaskCreator;
//   private _downloadResourceLoader: IDownloadResourceLoader;
//   private _downloadHelper: DownloadHelper;
//
//   constructor(downloadHelper: DownloadHelper,
//       downloadResourceLoader: IDownloadResourceLoader,
//       viewFactory: IViewFactory,
//       downloadTaskCreator: IDownloadTaskCreator) {
//     super(downloadHelper, downloadResourceLoader);
//     this._viewFactory = viewFactory;
//     this._downloadTaskCreator = downloadTaskCreator;
//     this._downloadHelper = downloadHelper;
//     this._downloadResourceLoader = downloadResourceLoader;
//   }
//
//   getId(popupInfo: string): string {
//     return "1";
//   }
//
//   trackDownloadStarted(popupInfo: string): void {
//
//   }
//
//   createDownloadTask(popupInfo: string): DownloadTask | null {
//     if (StringUtils.isNullOrEmpty(popupInfo)) {
//       return null;
//     }
//     popupInfo =
//         this._downloadTaskCreator.substituteUrlTemplateForPopupResource(popupInfo);
//     const resourceId: string = getResourceIdFromUrl(popupInfo);
//
//     let resourceType: string = TextureResource.TypeId;
//     if (PathUtils.getExtension(popupInfo) == WadExt) {
//       resourceType = SceneResource.TypeId;
//     }
//
//     return new DownloadTask(new DownloadId(downloadType, "1"), popupInfo,
//         new DownloadDestination(resourceType, resourceId));
//   }
// }
