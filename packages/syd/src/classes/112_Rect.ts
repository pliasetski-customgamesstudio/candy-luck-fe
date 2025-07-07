import { Vector2 } from './15_Vector2';

export class Rect {
  private static _empty: Rect;

  static get Empty(): Rect {
    if (!this._empty) {
      this._empty = new Rect(Vector2.Zero, Vector2.Zero);
    }
    return this._empty;
  }

  static fromSize(pos: Vector2, size: Vector2): Rect {
    return new Rect(pos, pos.add(size));
  }

  lt: Vector2;
  rb: Vector2;

  constructor(lt: Vector2, rb: Vector2) {
    this.lt = lt;
    this.rb = rb;
  }

  get size(): Vector2 {
    return this.rb.subtract(this.lt);
  }

  set size(v: Vector2) {
    this.rb = this.lt.add(v);
  }

  get center(): Vector2 {
    return new Vector2((this.lt.x + this.rb.x) * 0.5, (this.lt.y + this.rb.y) * 0.5);
  }

  get width(): number {
    return this.rb.x - this.lt.x;
  }

  get height(): number {
    return this.rb.y - this.lt.y;
  }

  clone(): Rect {
    return new Rect(this.lt.clone(), this.rb.clone());
  }

  toString(): string {
    return `{x:${this.lt.x} y:${this.lt.y} w:${this.size.x} h:${this.size.y}}`;
  }

  test(point: Vector2): boolean {
    return (
      this.lt.x <= point.x && this.rb.x >= point.x && this.lt.y <= point.y && this.rb.y >= point.y
    );
  }

  equals(other: any): boolean {
    if (this === other) {
      return true;
    }
    return other instanceof Rect && this.lt.equals(other.lt) && this.rb.equals(other.rb);
  }

  get hashCode(): number {
    return this.lt.hashCode ^ this.rb.hashCode;
  }

  get isEmpty(): boolean {
    return this.width === 0.0 || this.height === 0.0;
  }
}
