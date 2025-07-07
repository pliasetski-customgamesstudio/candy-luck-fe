import { Tuple3 } from './17_Tuple3';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { Tuple } from './0_Tuple';
import { DataRole } from './11_DataRole';
import { Index } from './28_Index';

export abstract class AbstractModel {
  private _dataChangedDispatcher = new EventDispatcher<Tuple3<Index, Index, number>>();
  private _columnsInsertedDispatcher = new EventDispatcher<Tuple<number, number>>();
  private _columnsRemovedDispatcher = new EventDispatcher<Tuple<number, number>>();
  private _rowsInsertedDispatcher = new EventDispatcher<Tuple<number, number>>();
  private _rowsRemovedDispatcher = new EventDispatcher<Tuple<number, number>>();

  get dataChanged(): EventStream<Tuple3<Index, Index, number>> {
    return this._dataChangedDispatcher.eventStream;
  }

  get columnsInserted(): EventStream<Tuple<number, number>> {
    return this._columnsInsertedDispatcher.eventStream;
  }

  get columnsRemoved(): EventStream<Tuple<number, number>> {
    return this._columnsRemovedDispatcher.eventStream;
  }

  get rowsInserted(): EventStream<Tuple<number, number>> {
    return this._rowsInsertedDispatcher.eventStream;
  }

  get rowsRemoved(): EventStream<Tuple<number, number>> {
    return this._rowsRemovedDispatcher.eventStream;
  }

  hasIndex(row: number, column: number): boolean {
    return row >= 0 && column >= 0 && row < this.rowsCount && column < this.columnsCount;
  }

  abstract get rowsCount(): number;

  abstract get columnsCount(): number;

  invalidate(role: number = 0): void {
    const leftTop = new Index(0, 0, this);
    const rightBottom = new Index(this.rowsCount, this.columnsCount, this);
    this.onDataChanged(leftTop, rightBottom, role);
  }

  insertRow(row: number): boolean {
    return this.insertRows(row, 1);
  }

  removeRow(row: number): boolean {
    return this.removeRows(row, 1);
  }

  insertColumn(column: number): boolean {
    return this.insertColumns(column, 1);
  }

  removeColumn(column: number): boolean {
    return this.removeColumns(column, 1);
  }

  insertRows(startRow: number, count: number): boolean {
    let res = false;
    if (startRow >= 0 && startRow <= this.rowsCount) {
      res = this.doInsertRows(startRow, count);
      if (res) {
        this.onRowsInserted(startRow, count);
      }
    }
    return res;
  }

  removeRows(startRow: number, count: number): boolean {
    let res = false;
    const rowsCnt = this.rowsCount;
    if (startRow >= 0 && startRow < rowsCnt) {
      if (startRow + count > rowsCnt) {
        count = rowsCnt - startRow;
      }
      res = this.doRemoveRows(startRow, count);
      if (res) {
        this.onRowsRemoved(startRow, count);
      }
    }
    return res;
  }

  insertColumns(startColumn: number, count: number): boolean {
    let res = false;
    if (startColumn >= 0 && startColumn <= this.columnsCount) {
      res = this.doInsertColumns(startColumn, count);
      if (res) {
        this.onColumnsInserted(startColumn, count);
      }
    }
    return res;
  }

  removeColumns(startColumn: number, count: number): boolean {
    let res = false;
    const columnsCnt = this.columnsCount;
    if (startColumn >= 0 && startColumn < columnsCnt) {
      if (startColumn + count > columnsCnt) {
        count = columnsCnt - startColumn;
      }
      res = this.doRemoveColumns(startColumn, count);
      if (res) {
        this.onColumnsRemoved(startColumn, count);
      }
    }
    return res;
  }

  doInsertRows(_startRow: number, _count: number): boolean {
    return false;
  }

  doRemoveRows(_startRow: number, _count: number): boolean {
    return false;
  }

  doInsertColumns(_startColumn: number, _count: number): boolean {
    return false;
  }

  doRemoveColumns(_startColumn: number, _count: number): boolean {
    return false;
  }

  typeRole(_index: Index): any {
    return null;
  }

  orderRole(_index: Index): number {
    return 0;
  }

  dataByRole(index: Index, role: number): any {
    switch (role) {
      case DataRole.dataType:
        return this.typeRole(index);
      case DataRole.order:
        return this.orderRole(index);
    }
    return null;
  }

  setData(_index: Index, _data: any): boolean {
    return false;
  }

  abstract data(index: Index): any;

  abstract index(row: number, column: number): Index;

  createIndex(row: number, column: number): Index {
    return new Index(row, column, this);
  }

  onColumnsInserted(startColumn: number, count: number): void {
    this._columnsInsertedDispatcher.dispatchEvent(new Tuple(startColumn, count));
  }

  onColumnsRemoved(startColumn: number, count: number): void {
    this._columnsRemovedDispatcher.dispatchEvent(new Tuple(startColumn, count));
  }

  onRowsInserted(startRow: number, count: number): void {
    this._rowsInsertedDispatcher.dispatchEvent(new Tuple(startRow, count));
  }

  onRowsRemoved(startRow: number, count: number): void {
    this._rowsRemovedDispatcher.dispatchEvent(new Tuple(startRow, count));
  }

  onDataChanged(leftTop: Index, rightBottom: Index, role: number = 0): void {
    this._dataChangedDispatcher.dispatchEvent(new Tuple3(leftTop, rightBottom, role));
  }
}
