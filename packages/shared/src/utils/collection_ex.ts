import { Func1 } from '../func/func_imp';

export class CollectionEx {
  public static randomize<T>(source: T[]): T[] {
    return [...source].sort(() => this.getRandomInt(-1, 1));
  }

  private static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static max(source: any[], test: Func1<any, any>): any | null {
    if (source.length === 0) {
      return null;
    }

    let max = test(source[0]);

    for (let i = 1; i < source.length; i++) {
      const current = test(source[i]);
      if (current > max) {
        max = current;
      }
    }

    return max;
  }

  public static min(source: any[], test: Func1<any, any>): any | null {
    if (source.length === 0) {
      return null;
    }

    let min = test(source[0]);

    for (let i = 1; i < source.length; i++) {
      const current = test(source[i]);
      if (current < min) {
        min = current;
      }
    }

    return min;
  }

  public static range(from: number, to?: number): number[] {
    return to !== undefined
      ? Array.from({ length: to - from + 1 }, (_, index) => index + from)
      : Array.from({ length: from }, (_, index) => index);
  }

  public static union<T>(list1: T[], list2: T[]): T[] {
    const result: T[] = [...list1];
    list2.forEach((item2) => {
      if (!list1.includes(item2)) {
        result.push(item2);
      }
    });
    return result;
  }
}
