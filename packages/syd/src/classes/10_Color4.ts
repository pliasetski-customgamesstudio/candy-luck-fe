export class Color4 {
  static readonly Red = new Color4(1.0, 0.0, 0.0, 1.0);
  static readonly Green = new Color4(0.0, 1.0, 0.0, 1.0);
  static readonly Blue = new Color4(0.0, 0.0, 1.0, 1.0);

  static readonly White = new Color4(1.0, 1.0, 1.0, 1.0);
  static readonly Black = new Color4(0.0, 0.0, 0.0, 1.0);

  static readonly Cyan = new Color4(0.0, 1.0, 1.0, 1.0);
  static readonly Transparent = new Color4(0.0, 0.0, 0.0, 0.0);

  static undefined(): Color4 {
    return new Color4(-1.0, -1.0, -1.0, -1.0);
  }

  static Lerp(from: Color4, to: Color4, t: number): Color4 {
    const result = new Color4(0, 0, 0, 0);
    Color4.LerpInplace(from, to, t, result);
    return result;
  }

  static LerpInplace(from: Color4, to: Color4, t: number, result: Color4): void {
    result.a = Color4.lerp(from.a, to.a, t);
    result.r = Color4.lerp(from.r, to.r, t);
    result.g = Color4.lerp(from.g, to.g, t);
    result.b = Color4.lerp(from.b, to.b, t);
  }

  static Mul(c: Color4, v: number): Color4 {
    return new Color4(c.r * v, c.g * v, c.b * v, c.a * v);
  }

  static MulInplace(lhs: Color4, rhs: Color4, result: Color4): void {
    result.r = lhs.r * rhs.r;
    result.g = lhs.g * rhs.g;
    result.b = lhs.b * rhs.b;
    result.a = lhs.a * rhs.a;
  }

  r: number;
  g: number;
  b: number;
  a: number;

  get asInt32(): number {
    return (
      ((this.a * 255.0) << 24) |
      ((this.b * 255.0) << 16) |
      ((this.g * 255.0) << 8) |
      (this.r * 255.0)
    );
  }

  get asHtml(): string {
    const _r = Math.round(this.r * 255.0);
    const _g = Math.round(this.g * 255.0);
    const _b = Math.round(this.b * 255.0);
    const _a = Math.round(this.a * 255.0);
    return `rgba(${_r},${_g},${_b},${this.a})`;
  }

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  clone(): Color4 {
    return new Color4(this.r, this.g, this.b, this.a);
  }

  withAlpha(a: number): Color4 {
    const result = this.clone();
    result.a = a;
    return result;
  }

  equals(other: Color4): boolean {
    return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  multiply(other: Color4): Color4 {
    return new Color4(this.r * other.r, this.g * other.g, this.b * other.b, this.a * other.a);
  }

  add(other: Color4): Color4 {
    return new Color4(this.r + other.r, this.g + other.g, this.b + other.b, this.a + other.a);
  }

  subtract(other: Color4): Color4 {
    return new Color4(this.r - other.r, this.g - other.g, this.b - other.b, this.a - other.a);
  }
}
