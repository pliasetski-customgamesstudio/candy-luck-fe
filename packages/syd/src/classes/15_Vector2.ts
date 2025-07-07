import { EPSILON, lerp } from './globalFunctions';

export class Vector2 {
  static readonly Zero: Vector2 = new Vector2(0, 0);
  static readonly One: Vector2 = new Vector2(1, 1);

  // TODO: проверить, что с -1000 все ок.
  static undefined(): Vector2 {
    return new Vector2(-1000, -1000);
  }

  static lerp(from: Vector2, to: Vector2, t: number): Vector2 {
    const result = Vector2.undefined();
    Vector2.lerpInplace(from, to, t, result);
    return result;
  }

  static lerpInplace(from: Vector2, to: Vector2, t: number, result: Vector2): void {
    result.x = lerp(from.x, to.x, t);
    result.y = lerp(from.y, to.y, t);
  }

  static rotate(v: Vector2, radians: number): Vector2 {
    const sine = Math.sin(radians);
    const cosine = Math.cos(radians);

    const tx = v.x;
    const ty = v.y;

    return new Vector2(cosine * tx - sine * ty, sine * tx + cosine * ty);
  }

  private _x: number;
  private _y: number;

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    if (this === Vector2.Zero) {
      console.error('Cannot modify Zero vector.');
    } else {
      this._x = value;
    }
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    if (this === Vector2.Zero) {
      console.error('Cannot modify Zero vector.');
    } else {
      this._y = value;
    }
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  multiply(other: Vector2): Vector2 {
    return new Vector2(this.x * other.x, this.y * other.y);
  }

  divide(other: Vector2): Vector2 {
    return new Vector2(this.x / other.x, this.y / other.y);
  }

  negate(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  mulNum(v: number): Vector2 {
    this.x *= v;
    this.y *= v;
    return this;
  }

  addVector(other: Vector2): void {
    this.x += other.x;
    this.y += other.y;
  }

  subVector(other: Vector2): void {
    this.x -= other.x;
    this.y -= other.y;
  }

  normalize(): void {
    const len = this.length;

    if (len < EPSILON) {
      return;
    }

    const invLen = 1.0 / len;
    this.x *= invLen;
    this.y *= invLen;
  }

  normalized(): Vector2 {
    const result = this.clone();
    result.normalize();
    return result;
  }

  distanceSquared(to: Vector2): number {
    const dx = this.x - to.x;
    const dy = this.y - to.y;
    return dx * dx + dy * dy;
  }

  dot(b: Vector2): number {
    return this.x * b.x + this.y * b.y;
  }

  distance(to: Vector2): number {
    return Math.sqrt(this.distanceSquared(to));
  }

  equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  get hashCode(): number {
    return -Math.floor(this.x) ^ Math.floor(this.y);
  }

  toString(): string {
    return `{x:${this.x} y:${this.y}}`;
  }
}

export function linesIntersection(
  startA: Vector2,
  endA: Vector2,
  startB: Vector2,
  endB: Vector2
): Vector2 | null {
  let result: Vector2 | null = null;
  const delta =
    (startA.x - endA.x) * (startB.y - endB.y) - (startA.y - endA.y) * (startB.x - endB.x);
  if (delta !== 0.0) {
    const dx =
      (startA.x * endA.y - startA.y * endA.x) * (startB.x - endB.x) -
      (startA.x - endA.x) * (startB.x * endB.y - startB.y * endB.x);
    const dy =
      (startA.x * endA.y - startA.y * endA.x) * (startB.y - endB.y) -
      (startA.y - endA.y) * (startB.x * endB.y - startB.y * endB.x);
    result = new Vector2(dx / delta, dy / delta);
    return result;
  }
  return result;
}

export function segmentsIntersection(
  startA: Vector2,
  endA: Vector2,
  startB: Vector2,
  endB: Vector2
): Vector2 | null {
  const result = new Vector2(0, 0);
  const d = (startA.x - endA.x) * (endB.y - startB.y) - (startA.y - endA.y) * (endB.x - startB.x);
  const da =
    (startA.x - startB.x) * (endB.y - startB.y) - (startA.y - startB.y) * (endB.x - startB.x);
  const db =
    (startA.x - endA.x) * (startA.y - startB.y) - (startA.y - endA.y) * (startA.x - startB.x);
  const ta = da / d;
  const tb = db / d;
  if (ta >= 0 && ta <= 1 && tb >= 0 && tb <= 1) {
    result.x = startA.x + ta * (endA.x - startA.x);
    result.y = startA.y + ta * (endA.y - startA.y);
    return result;
  }
  return null;
}
