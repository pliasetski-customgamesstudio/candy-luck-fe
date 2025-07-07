import { Func1, Func2 } from '../func/func_imp';

export class ListUtil {
  /**
   * @deprecated use Array.some instead
   */
  static any<T>(list: T[], func: Func1<T, boolean>): boolean {
    for (const el of list) {
      if (func(el)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @deprecated use Array.every instead
   */
  static all<T>(list: T[], func: Func1<T, boolean>): boolean {
    for (const el of list) {
      if (!func(el)) {
        return false;
      }
    }

    return true;
  }

  static sum(list: number[]): number {
    let sum = 0;
    for (let i = 0; i < list.length; i++) {
      sum += list[i];
    }
    return sum;
  }

  static union<T>(list1: T[], list2: T[]): T[] {
    const result = list1.slice();
    result.push(...list2);
    return ListUtil.distinct(result);
  }

  /**
   * @deprecated use Array.flatMap instead
   */
  static mapMany<T, R>(list: T[], f: Func1<T, R[]>): R[] {
    return list.flatMap(f || []) as R[];
  }

  static distinct<T>(list: T[]): T[] {
    return Array.from(new Set(list || []));
  }

  /**
   * @deprecated use Array.indexOf instead
   */
  static indexOf<T>(list: T[], func: Func1<T, boolean>): number {
    for (let i = 0; i < list.length; i++) {
      if (func(list[i])) {
        return i;
      }
    }
    return -1;
  }

  static mapIndexed<T, R>(list: T[], func: Func2<T, number, R>): R[] {
    const result: R[] = [];
    for (let i = 0; i < list.length; i++) {
      result.push(func(list[i], i)!);
    }
    return result;
  }

  /**
   * @deprecated use Array.indexOf instead
   */
  static reverse<T>(list: T[]): void {
    list.reverse();
  }

  static orderBy<T extends object>(seq: T[], on: Func1<T, T>): T[] {
    return [...seq].sort((a, b) => on(a)!.toString().localeCompare(on(b)!.toString()));
  }

  /**
   * @deprecated use Array.concat or spread operator (...)
   */
  static concat<T>(seq: Iterable<T>, withSeq: Iterable<T>): T[] {
    return [...seq, ...withSeq];
  }

  static collectionsEquivalent<T>(seq1: T[], seq2: T[]): boolean {
    return (
      seq1.length === seq2.length &&
      seq1.every((el) => seq2.includes(el)) &&
      seq2.every((el) => seq1.includes(el))
    );
  }

  static groupBy<T, K>(elements: K[], func: Func1<K, T>): Map<T, K[]> {
    const map = new Map<T, K[]>();
    for (const element of elements) {
      const groupValue = func(element);
      let collection = groupValue && map.get(groupValue);

      if (!collection) {
        collection = [];
        map.set(groupValue!, collection);
      }

      collection.push(element);
    }

    return map;
  }
}
