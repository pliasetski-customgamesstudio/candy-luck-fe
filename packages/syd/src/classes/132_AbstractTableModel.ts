import { AbstractModel } from './205_AbstractModel';
import { Index } from './28_Index';

export abstract class AbstractTableModel extends AbstractModel {
  index(row: number, column: number): Index {
    return this.hasIndex(row, column) ? this.createIndex(row, column) : Index.none;
  }
}
