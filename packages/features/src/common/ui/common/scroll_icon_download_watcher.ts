// import { IUpdatableScrollModel } from "@cgs/common";
//
// class ScrollIconDownloadWatcher implements IDownloadQueue, IDownloadWatcher {
//   private _scrollModel: IUpdatableScrollModel;
//   private _downloads: IconDownload[];
//   private _updateBatchSize: number;
//   private _completed: IconDownload[] = [];
//   private _taskModelDict: Map<IDownloadTask, IconModelBase[]> = new Map<IDownloadTask, IconModelBase[]>();
//
//   private _currentIndex: number = -1;
//   private _completedCount: number = 0;
//
//   constructor(scrollModel: IUpdatableScrollModel, downloads: IconDownload[], updateBatchSize: number) {
//     this._scrollModel = scrollModel;
//     this._downloads = downloads;
//     this._updateBatchSize = updateBatchSize;
//
//     for (let iconDownload of this._downloads) {
//       if (this._taskModelDict.has(iconDownload.downloadTask)) {
//         this._taskModelDict.get(iconDownload.downloadTask).push(iconDownload.model);
//       } else {
//         this._taskModelDict.set(iconDownload.downloadTask, [iconDownload.model]);
//       }
//     }
//   }
//
//   getNextTask(): IDownloadTask {
//     this._currentIndex++;
//     return (this._currentIndex < this._downloads.length) ? this._downloads[this._currentIndex].downloadTask : null;
//   }
//
//   onDownloadComplete(downloadTask: IDownloadTask): void {
//     if (!this._taskModelDict.has(downloadTask)) {
//       return;
//     }
//     this._completed.push(...this._taskModelDict.get(downloadTask).map(model => new IconDownload(downloadTask, model)));
//     this._updateIfNeeded(++this._completedCount);
//   }
//
//   private _updateIfNeeded(completedCount: number): void {
//     if (this._completed.length >= this._updateBatchSize || completedCount >= this._taskModelDict.size) {
//       const updateBatch = [...this._completed];
//       ContextMarshaller.marshalAsync(() => this._updateScrollModel(updateBatch));
//       this._completed = [];
//     }
//   }
//
//   private _updateScrollModel(completed: IconDownload[]): void {
//   }
//
//   onDownloadFailed(downloadTask: IDownloadTask): void {
//     this._updateIfNeeded(++this._completedCount);
//   }
// }
