export class BitsHelper {
  static CountOnes(x: number): number {
    x -= (x >> 1) & 0x55555555;
    x = ((x >> 2) & 0x33333333) + (x & 0x33333333);
    x = ((x >> 4) + x) & 0x0f0f0f0f;
    x += x >> 8;
    x += x >> 16;
    return x & 0x0000003f;
  }

  static HasBits(x: number, mask: number): boolean {
    return (x & mask) !== 0;
  }

  static ClearBits(x: number, mask: number): number {
    return x & ~mask;
  }

  static ToBinary(n: number): string {
    if (n < 0) {
      throw new Error('negative numbers require 2s complement');
    }
    if (n === 0) {
      return '0';
    }
    let res = '';
    while (n > 0) {
      res = (n % 2).toString() + res;
      n = Math.floor(n / 2);
    }
    return res;
  }
}
