import { Vector2 } from './15_Vector2';

export class Matrix3 {
  static readonly Identity: Matrix3 = new Matrix3(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);

  // TODO: обсудить, может просто в 0 задать
  static undefined(): Matrix3 {
    return new Matrix3(Number.NaN, Number.NaN, Number.NaN, -Number.NaN, Number.NaN, Number.NaN);
  }

  static fromRotation(angle: number): Matrix3 {
    const cosv = Math.cos(angle);
    const sinv = Math.sin(angle);

    return new Matrix3(cosv, sinv, -sinv, cosv, 0.0, 0.0);
  }

  static fromScale(x: number, y: number): Matrix3 {
    return new Matrix3(x, 0.0, 0.0, y, 0.0, 0.0);
  }

  static fromTranslation(x: number, y: number): Matrix3 {
    return new Matrix3(1.0, 0.0, 0.0, 1.0, x, y);
  }

  static fromSkew(x: number, y: number): Matrix3 {
    const a = Math.cos(x);
    const c = -Math.sin(y);

    if (x === y) {
      return new Matrix3(a, -c, c, a, 0.0, 0.0);
    } else {
      return new Matrix3(a, Math.sin(x), c, Math.cos(y), 0.0, 0.0);
    }
  }

  static Multiply(l: Matrix3, r: Matrix3, result: Matrix3): void {
    result.a = l.a * r.a + l.b * r.c;
    result.b = l.a * r.b + l.b * r.d;
    result.c = l.c * r.a + l.d * r.c;
    result.d = l.c * r.b + l.d * r.d;

    result.tx = l.tx * r.a + l.ty * r.c + r.tx;
    result.ty = l.tx * r.b + l.ty * r.d + r.ty;
  }

  static Make(
    scale: Vector2,
    skewx: number,
    skewy: number,
    rotation: number,
    pivot: Vector2,
    position: Vector2,
    result: Matrix3
  ): void {
    const skewXrotation = skewx + rotation;
    const skewYrotation = skewy + rotation;

    if (skewXrotation === 0.0 && skewYrotation === 0.0) {
      result.a = scale.x;
      result.b = 0.0;
      result.c = 0.0;
      result.d = scale.y;

      result.tx = position.x - pivot.x * scale.x;
      result.ty = position.y - pivot.y * scale.y;
    } else {
      const cosX = Math.cos(skewXrotation);
      const sinX = Math.sin(skewXrotation);

      if (skewXrotation === skewYrotation) {
        result.a = scale.x * cosX;
        result.b = scale.x * sinX;
        result.c = -scale.y * sinX;
        result.d = scale.y * cosX;
      } else {
        result.a = scale.x * cosX;
        result.b = scale.x * sinX;
        result.c = -scale.y * Math.sin(skewYrotation);
        result.d = scale.y * Math.cos(skewYrotation);
      }

      result.tx = position.x - (pivot.x * result.a + pivot.y * result.c);
      result.ty = position.y - (pivot.x * result.b + pivot.y * result.d);
    }
  }

  static Inverse(matrix: Matrix3, result: Matrix3): void {
    const det = matrix.a * matrix.d - matrix.b * matrix.c;

    result.a = matrix.d / det;
    result.b = -(matrix.b / det);
    result.c = -(matrix.c / det);
    result.d = matrix.a / det;
    result.tx = -(result.a * matrix.tx + result.c * matrix.ty);
    result.ty = -(result.b * matrix.tx + result.d * matrix.ty);
  }

  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;

  constructor(a: number, b: number, c: number, d: number, tx: number, ty: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  multiply(other: Matrix3): Matrix3 {
    const result = new Matrix3(0, 0, 0, 0, 0, 0);
    Matrix3.Multiply(this, other, result);
    return result;
  }

  transformVectorInplace(v: Vector2): void {
    const x = v.x * this.a + v.y * this.c + this.tx;
    const y = v.x * this.b + v.y * this.d + this.ty;
    v.x = x;
    v.y = y;
  }

  transformVector(v: Vector2): Vector2 {
    return new Vector2(
      v.x * this.a + v.y * this.c + this.tx,
      v.x * this.b + v.y * this.d + this.ty
    );
  }

  transformPoint(x: number, y: number): Vector2 {
    return new Vector2(x * this.a + y * this.c + this.tx, x * this.b + y * this.d + this.ty);
  }

  transformPointInplace(x: number, y: number, result: Vector2): void {
    result.x = x * this.a + y * this.c + this.tx;
    result.y = x * this.b + y * this.d + this.ty;
  }

  rotateVector(v: Vector2): Vector2 {
    return new Vector2(v.x * this.a + v.y * this.c, v.x * this.b + v.y * this.d);
  }

  rotateVectorInplace(v: Vector2): void {
    const x = v.x * this.a + v.y * this.c;
    const y = v.x * this.b + v.y * this.d;

    v.x = x;
    v.y = y;
  }

  toArray(): number[] {
    return [this.a, this.c, this.tx, this.b, this.d, this.ty, 0.0, 0.0, 1.0];
  }

  toList(): Float32Array {
    return new Float32Array(this.toArray());
  }

  clone(): Matrix3 {
    return new Matrix3(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }

  copyTo(to: Matrix3): void {
    to.a = this.a;
    to.b = this.b;
    to.c = this.c;
    to.d = this.d;
    to.tx = this.tx;
    to.ty = this.ty;
  }

  equals(other: Matrix3): boolean {
    return (
      this === other ||
      (this.a === other.a &&
        this.b === other.b &&
        this.c === other.c &&
        this.d === other.d &&
        this.tx === other.tx &&
        this.ty === other.ty)
    );
  }

  extractScale(): Vector2 {
    return new Vector2(
      Math.sqrt(this.a * this.a + this.b * this.b),
      Math.sqrt(this.c * this.c + this.d * this.d)
    );
  }

  toString(): string {
    return `{a:${this.a} b:${this.b} c:${this.c} d:${this.d} tx:${this.tx} ty:${this.ty}}`;
  }
}
