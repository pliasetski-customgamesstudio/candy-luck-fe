// TODO: Not so important on start, and probably isn't useful for slots anyway

// import { VisualIndex } from './111_VisualIndex';
// import { Rect } from './112_Rect';
// import { Vector2 } from './15_Vector2';
// import { ScrollResizeMode, Section } from './182_Section';
// import { AbstractModel } from './205_AbstractModel';
// import { IDataViewBinding } from './214_IDataViewBinding';
// import { AbstractScrollViewSceneObject } from './283_AbstractScrollViewSceneObject';
// import { Index } from './28_Index';
//
// export class TableViewSceneObject extends AbstractScrollViewSceneObject {
//   private _rowsInfo: Section = new Section();
//   private _columnsInfo: Section = new Section();
//   private _isContentChanged: boolean;
//
//   private _modelColumnsInsertedSub: StreamSubscription;
//   private _modelColumnsRemovedSub: StreamSubscription;
//   private _modelRowsInsertedSub: StreamSubscription;
//   private _modelRowsRemovedSub: StreamSubscription;
//
//   constructor(binding: IDataViewBinding = null) {
//     super(binding);
//     this.defaultColumnResizeMode = ScrollResizeMode.Content;
//     this.defaultRowResizeMode = ScrollResizeMode.Content;
//   }
//
//   set dataModel(value: AbstractModel) {
//     this._modelColumnsInsertedSub?.cancel();
//     this._modelColumnsRemovedSub?.cancel();
//     this._modelRowsInsertedSub?.cancel();
//     this._modelRowsRemovedSub?.cancel();
//     super.dataModel = value;
//     if (this.model) {
//       this._modelColumnsInsertedSub = this.model.columnsInserted
//         .listen((t) => this.onColumnsInserted(t.item1, t.item2));
//       this._modelColumnsRemovedSub = this.model.columnsRemoved
//         .listen((t) => this.onColumnsRemoved(t.item1, t.item2));
//       this._modelRowsInsertedSub = this.model.rowsInserted
//         .listen((t) => this.onRowsInserted(t.item1, t.item2));
//       this._modelRowsRemovedSub = this.model.rowsRemoved
//         .listen((t) => this.onRowsRemoved(t.item1, t.item2));
//     }
//   }
//
//   initializeImpl(): void {
//     this._updateSeries(this.dataModel, this.binding);
//     super.initializeImpl();
//   }
//
//   private _visualRectInternal(column: number, row: number): Rect {
//     return new Rect(
//       new Vector2(this._columnsInfo.offset(column), this._rowsInfo.offset(row)),
//       new Vector2(this._columnsInfo.getSize(column), this._rowsInfo.getSize(row))
//     );
//   }
//
//   visualRect(index: Index): Rect {
//     return this._visualRectInternal(index.column, index.row);
//   }
//
//   visibleIndexes(): VisualIndex[] {
//     const visibleList: VisualIndex[] = [];
//
//     const columnsCount = this.dataModel.columnsCount;
//     const rowsCount = this.dataModel.rowsCount;
//
//     const xOffset = this.contentOffset.x;
//     const yOffset = this.contentOffset.y;
//
//     const visWidth = this.size.x;
//     const visHeight = this.size.y;
//
//     const startColumn = Math.min(Math.max(this._columnsInfo.element(xOffset), 0), columnsCount - 1);
//     const startRow = Math.min(Math.max(this._rowsInfo.element(yOffset), 0), rowsCount - 1);
//
//     let row = startRow;
//     const visRect = this._visualRectInternal(startColumn, startRow);
//     for (let y = visRect.lt.y; (y < yOffset + visHeight) && (row < rowsCount); row++) {
//       let column = startColumn;
//       const rowHeight = this._rowsInfo.getSize(row);
//       for (let x = visRect.lt.x; (x < xOffset + visWidth) && (column < columnsCount); column++) {
//         const columnWidth = this._columnsInfo.getSize(column);
//         const index = this.dataModel.index(row, column);
//         visibleList.push(new VisualIndex(
//           index,
//           new Rect(new Vector2(x, y), new Vector2(columnWidth, rowHeight))
//         ));
//         x += columnWidth;
//       }
//       y += rowHeight;
//     }
//     return visibleList;
//   }
//
//   get defaultColumnWidth(): number {
//     return this._columnsInfo.defaultSize;
//   }
//
//   set defaultColumnWidth(value: number) {
//     this._columnsInfo.defaultSize = value;
//   }
//
//   get defaultRowHeight(): number {
//     return this._rowsInfo.defaultSize;
//   }
//
//   set defaultRowHeight(value: number) {
//     this._rowsInfo.defaultSize = value;
//   }
//
//   get defaultColumnResizeMode(): ScrollResizeMode {
//     return this._columnsInfo.defaultResizeMode;
//   }
//
//   set defaultColumnResizeMode(value: ScrollResizeMode) {
//     this._columnsInfo.defaultResizeMode = value;
//   }
//
//   get defaultRowResizeMode(): ScrollResizeMode {
//     return this._rowsInfo.defaultResizeMode;
//   }
//
//   set defaultRowResizeMode(value: ScrollResizeMode) {
//     this._rowsInfo.defaultResizeMode = value;
//   }
//
//   columnWidth(column: number): number {
//     return this._columnsInfo.getSize(column);
//   }
//
//   rowHeight(row: number): number {
//     return this._rowsInfo.getSize(row);
//   }
//
//   setColumnsWidth(column: number, width: number): void {
//     this._columnsInfo.setSize(column, width);
//     this._update();
//   }
//
//   setRowHeight(row: number, height: number): void {
//     this._rowsInfo.setSize(row, height);
//     this._update();
//   }
//
//   columnResizeMode(column: number): ScrollResizeMode {
//     return this._columnsInfo.getResizeMode(column);
//   }
//
//   rowResizeMode(row: number): ScrollResizeMode {
//     return this._rowsInfo.getResizeMode(row);
//   }
//
//   setColumnResizeMode(column: number, mode: ScrollResizeMode): void {
//     if (mode !== this._columnsInfo.getResizeMode(column)) {
//       this._columnsInfo.setResizeMode(column, mode);
//       this._update();
//     }
//   }
//
//   setRowResizeMode(row: number, mode: ScrollResizeMode): void {
//     if (mode !== this._rowsInfo.getResizeMode(row)) {
//       this._rowsInfo.setResizeMode(row, mode);
//       this._update();
//     }
//   }
//
//   private _updateSeries(model: AbstractModel, binding: IDataViewBinding): void {
//     if (model) {
//       this._rowsInfo.count = model.rowsCount;
//       this._columnsInfo.count = model.columnsCount;
//
//       if (binding) {
//         const rowsSizeArray: number[] = new Array(this._rowsInfo.count).fill(0);
//         const columnsSizeArray: number[] = new Array(this._columnsInfo.count).fill(0);
//
//         for (let row = 0; row < this._rowsInfo.count; row++) {
//           const rowSizeByContent = this._rowsInfo.getResizeMode(row) === ScrollResizeMode.Content;
//
//           for (let column = 0; column < this._columnsInfo.count; column++) {
//             const columnsSizeByContent = this._columnsInfo.getResizeMode(column) === ScrollResizeMode.Content;
//             if (columnsSizeByContent || rowSizeByContent) {
//               const index = model.index(row, column);
//               let size = new Vector2(this.defaultColumnWidth, this.defaultRowHeight);
//               const dataType = model.typeRole(index);
//               const sizeHint = binding.sizeHint(index, dataType);
//               if (!sizeHint.equals(Vector2.Zero)) {
//                 size = sizeHint;
//               }
//               if (rowSizeByContent && size.y > rowsSizeArray[row]) {
//                 rowsSizeArray[row] = size.y;
//               }
//               if (columnsSizeByContent && size.x > columnsSizeArray[column]) {
//                 columnsSizeArray[column] = size.x;
//               }
//             }
//           }
//         }
//         for (let i = 0; i < rowsSizeArray.length; i++) {
//           if (rowsSizeArray[i] > 0) {
//             this._rowsInfo.setSize(i, rowsSizeArray[i]);
//           }
//         }
//         for (let i = 0; i < columnsSizeArray.length; i++) {
//           if (columnsSizeArray[i] > 0) {
//             this._columnsInfo.setSize(i, columnsSizeArray[i]);
//           }
//         }
//       }
//     }
//   }
//
//   columnAt(x: number): number {
//     return this._columnsInfo.element(x);
//   }
//
//   rowAt(y: number): number {
//     return this._rowsInfo.element(y);
//   }
//
//   onBindingChanged(): void {
//     if (this.isInitialized) {
//       this._updateSeries(this.dataModel, this.binding);
//     }
//     super.onBindingChanged();
//   }
//
//   onModelChanged(): void {
//     if (this.isInitialized) {
//       this._updateSeries(this.dataModel, this.binding);
//     }
//     super.onModelChanged();
//   }
//
//   onRowsInserted(startRow: number, count: number): void {
//     this._rowsInfo.insert(startRow, count);
//     this._updateAfterRowInsert();
//     this.onModelChanged();
//   }
//
//   onColumnsInserted(startColumn: number, count: number): void {
//     this._columnsInfo.insert(startColumn, count);
//     this._updateAfterColumnInsert();
//     this.onModelChanged();
//   }
//
//   onRowsRemoved(startRow: number, count: number): void {
//     this._rowsInfo.remove(startRow, count);
//     this._updateAfterRowRemove();
//     this.onModelChanged();
//   }
//
//   onColumnsRemoved(startColumn: number, count: number): void {
//     this._columnsInfo.remove(startColumn, count);
//     this._updateAfterColumnRemove();
//     this.onModelChanged();
//   }
//
//   private _updateAfterRowInsert(): void {
//     if (this.model.columnsCount === 0) {
//       this._columnsInfo.insert(0, 1);
//     }
//   }
//
//   private _updateAfterColumnInsert(): void {
//     if (this.model.rowsCount === 0) {
//       this._rowsInfo.insert(0, 1);
//     }
//   }
//
//   private _updateAfterRowRemove(): void {
//     if (this.model.rowsCount === 0) {
//       this._columnsInfo.clear();
//     }
//   }
//
//   private _updateAfterColumnRemove(): void {
//     if (this.model.columnsCount === 0) {
//       this._rowsInfo.clear();
//     }
//   }
//
//   private _update(): void {
//     if (this.isInitialized) {
//       this.updateGeometry();
//       this.updateContent(true);
//     }
//   }
//
//   updateGeometry(): void {
//     const width = this._columnsInfo.length();
//     const height = this._rowsInfo.length();
//     if (this.contentSize.x !== width || this.contentSize.y !== height) {
//       this.contentSize = new Vector2(width, height);
//     }
//   }
//
//   setContentSize(size: Vector2, index: Index): void {
//     const column = index.column;
//     const row = index.row;
//     if (this._columnsInfo.getResizeMode(column) === ScrollResizeMode.Content &&
//       this._columnsInfo.getSize(column) !== size.x) {
//       this._isContentChanged = true;
//       this._columnsInfo.setSize(column, size.x);
//     }
//     if (this._rowsInfo.getResizeMode(row) === ScrollResizeMode.Content &&
//       this._rowsInfo.getSize(row) !== size.y) {
//       this._isContentChanged = true;
//       this._rowsInfo.setSize(row, size.y);
//     }
//   }
//
//   beginUpdateContent(): void {
//     this._isContentChanged = false;
//   }
//
//   endUpdateContent(): void {
//     if (this._isContentChanged) {
//       this._update();
//     }
//   }
//
//   onPointTouch(point: Vector2): void {
//     const column = this.columnAt(point.x + this.contentOffset.x);
//     const row = this.rowAt(point.y + this.contentOffset.y);
//     if (this.model) {
//       const index = this.model.index(row, column);
//       if (index.isValid) {
//         this.doIndexTouch(index);
//       }
//     }
//   }
//
//   onPointTouchUp(point: Vector2): void {
//     const column = this.columnAt(point.x + this.contentOffset.x);
//     const row = this.rowAt(point.y + this.contentOffset.y);
//     if (this.model) {
//       const index = this.model.index(row, column);
//       if (index.isValid) {
//         this.doIndexTouchUp(index);
//       }
//     }
//   }
// }
