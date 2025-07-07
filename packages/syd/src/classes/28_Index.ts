import { IAbstractModel } from './205_IAbstractModel';

export class Index {
  readonly row: number;
  readonly column: number;
  readonly model: IAbstractModel | null = null;
  static readonly none: Index = new Index(-1, -1);

  constructor(row: number, column: number, model: IAbstractModel | null = null) {
    this.row = row;
    this.column = column;
    this.model = model;
  }

  get isValid(): boolean {
    return this.column >= 0 && this.row >= 0 && !!this.model;
  }

  get hashCode(): number {
    return this.row ^ this.column;
  }

  greaterThan(other: Index): boolean {
    return (
      this.column * this.column + this.row * this.row >
      other.column * other.column + other.row * other.row
    );
  }

  lessThan(other: Index): boolean {
    return (
      this.column * this.column + this.row * this.row <
      other.column * other.column + other.row * other.row
    );
  }

  greaterThanOrEqual(other: Index): boolean {
    return (
      this.column * this.column + this.row * this.row >=
      other.column * other.column + other.row * other.row
    );
  }

  lessThanOrEqual(other: Index): boolean {
    return (
      this.column * this.column + this.row * this.row <=
      other.column * other.column + other.row * other.row
    );
  }

  equals(other: Index): boolean {
    return other instanceof Index && this.row === other.row && this.column === other.column;
  }

  toString(): string {
    return `Index (R: ${this.row}, C: ${this.column})`;
  }

  clone(): Index {
    return new Index(this.row, this.column, this.model);
  }
}
