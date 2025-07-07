import { VoidFunc1 } from '../func/func_imp';

export class IntegerConstants {
  static readonly MaxValue: number = Number.MAX_SAFE_INTEGER;
  static readonly MinValue: number = Number.MIN_SAFE_INTEGER;

  static tryParse(value: string, assignmentFunc: VoidFunc1<number>): boolean {
    try {
      let parsed = true;
      const res = parseInt(value, 10);
      if (!isNaN(res)) {
        assignmentFunc(res);
      } else {
        parsed = false;
      }
      return parsed;
    } catch {
      return false;
    }
  }
}

export class DateTimeConstants {
  static readonly MaxValue: Date = new Date(8640000000000000);
  static readonly MinValue: Date = new Date(-8640000000000000);
}
