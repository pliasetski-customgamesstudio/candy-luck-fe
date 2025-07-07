export class MathHelper {
  static linearInterpolation(value1: number, value2: number, amount: number): number {
    return value1 + (value2 - value1) * amount;
  }

  static easeInOutCubic(r: number, x0: number, dx: number): number {
    r *= 2;
    if (r < 1) {
      return (dx / 2) * r * r * r + x0;
    }
    return (dx / 2) * ((r -= 2) * r * r + 2) + x0;
  }
}
