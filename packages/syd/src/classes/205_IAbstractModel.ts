import { EventStream } from './22_EventStreamSubscription';
import { Tuple3 } from './17_Tuple3';
import { Index } from './28_Index';
import { Tuple } from './0_Tuple';

/* Этот интерфейс нужен, чтобы избавится от циклических зависимостей */
export interface IAbstractModel {
  get dataChanged(): EventStream<Tuple3<Index, Index, number>>;

  get columnsInserted(): EventStream<Tuple<number, number>>;

  get columnsRemoved(): EventStream<Tuple<number, number>>;

  get rowsInserted(): EventStream<Tuple<number, number>>;

  get rowsRemoved(): EventStream<Tuple<number, number>>;

  hasIndex(row: number, column: number): boolean;

  get rowsCount(): number;

  get columnsCount(): number;

  invalidate(role: number): void;

  insertRow(row: number): boolean;

  removeRow(row: number): boolean;

  insertColumn(column: number): boolean;

  removeColumn(column: number): boolean;

  insertRows(startRow: number, count: number): boolean;

  removeRows(startRow: number, count: number): boolean;

  insertColumns(startColumn: number, count: number): boolean;

  removeColumns(startColumn: number, count: number): boolean;

  doInsertRows(startRow: number, count: number): boolean;

  doRemoveRows(startRow: number, count: number): boolean;

  doInsertColumns(startColumn: number, count: number): boolean;

  doRemoveColumns(startColumn: number, count: number): boolean;

  typeRole(index: Index): any;

  orderRole(index: Index): number;

  dataByRole(index: Index, role: number): any;

  setData(index: Index, data: any): boolean;

  data(index: Index): any;

  index(row: number, column: number): Index;

  createIndex(row: number, column: number): Index;

  onColumnsInserted(startColumn: number, count: number): void;

  onColumnsRemoved(startColumn: number, count: number): void;

  onRowsInserted(startRow: number, count: number): void;

  onRowsRemoved(startRow: number, count: number): void;

  onDataChanged(leftTop: Index, rightBottom: Index, role: number): void;
}
